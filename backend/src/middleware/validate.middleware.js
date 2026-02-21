/**
 * validate.middleware.js
 *
 * Factory that accepts a Zod schema and returns an Express middleware.
 * Validates req.body against the schema; on failure returns 422 with
 * structured field errors.
 */
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));

        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    // Attach parsed (sanitised) data back to req
    req.validatedBody = result.data;
    next();
};
