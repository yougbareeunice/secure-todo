import { Schema, model } from 'mongoose';

const refreshTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // We store a SHA-256 hash, never the token itself: if the database
    // leaks, the attacker still cannot use the tokens.
    tokenHash: { type: String, required: true, unique: true },
    // All tokens issued from the same login share one family id.
    family: { type: String, required: true, index: true },
    // Set when the token has been exchanged for a new one.
    usedAt: { type: Date, default: null },
    // TTL index: MongoDB deletes the document once `expiresAt` is past.
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true },
);

export const RefreshToken = model('RefreshToken', refreshTokenSchema);