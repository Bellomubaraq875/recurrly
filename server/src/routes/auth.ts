import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireAuth, signToken } from '../middleware/auth';
import { Subscription } from '../models/Subscription';
import { User, publicUser } from '../models/User';
import { HttpError, asyncHandler } from '../utils/http';

const router = Router();

const currencies = ['NGN', 'USD', 'EUR', 'GBP', 'GHS', 'KES', 'ZAR', 'CAD'] as const;

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  currency: z.enum(currencies).optional(),
  reminderDaysBefore: z.number().int().min(0).max(14).optional(),
});

const tokenSchema = z.object({ token: z.string().min(10).max(200) });

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const email = body.email.toLowerCase();
    if (await User.findOne({ email })) throw new HttpError(409, 'Email already registered');
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({ name: body.name, email, passwordHash });
    res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({ email: body.email.toLowerCase() });
    const valid = user ? await bcrypt.compare(body.password, user.passwordHash) : false;
    if (!user || !valid) throw new HttpError(401, 'Invalid email or password');
    res.json({ token: signToken(user.id), user: publicUser(user) });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(401, 'Account not found');
    res.json({ user: publicUser(user) });
  })
);

router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const patch = profileSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.userId, patch, { new: true });
    if (!user) throw new HttpError(401, 'Account not found');
    res.json({ user: publicUser(user) });
  })
);

router.post(
  '/push-token',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { token } = tokenSchema.parse(req.body);
    await User.updateMany({ pushTokens: token, _id: { $ne: req.userId } }, { $pull: { pushTokens: token } });
    await User.findByIdAndUpdate(req.userId, { $addToSet: { pushTokens: token } });
    res.json({ ok: true });
  })
);

router.post(
  '/push-token/remove',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { token } = tokenSchema.parse(req.body);
    await User.findByIdAndUpdate(req.userId, { $pull: { pushTokens: token } });
    res.json({ ok: true });
  })
);

router.delete(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    await Subscription.deleteMany({ user: req.userId });
    await User.findByIdAndDelete(req.userId);
    res.json({ ok: true });
  })
);

export default router;
