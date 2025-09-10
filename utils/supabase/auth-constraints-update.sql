-- RENTPARLO.PK AUTHENTICATION CONSTRAINTS UPDATE - corrected

-- Ensure UUID generator extension (install into extensions schema)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- 1. Add unique indexes to users table (NULLs excluded)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON public.users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON public.users (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_guest_id_unique ON public.users (guest_id) WHERE guest_id IS NOT NULL;

-- 5-6. Unique indexes for seller_profiles
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_profiles_phone_unique ON public.seller_profiles (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_profiles_email_unique ON public.seller_profiles (email) WHERE email IS NOT NULL;

-- 2. users phone CHECK
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS valid_phone_format;
ALTER TABLE public.users ADD CONSTRAINT valid_phone_format CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}');

-- 3. users email CHECK
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS valid_email_format;
ALTER TABLE public.users ADD CONSTRAINT valid_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}');

-- 7. seller_profiles phone CHECK
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS valid_seller_phone_format;
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_seller_phone_format CHECK (phone IS NULL OR phone ~ '^03[0-9]{2}[0-9]{7}');

-- 8. seller_profiles email CHECK
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS valid_seller_email_format;
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_seller_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}');

-- 9. seller_profiles CNIC CHECK
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS valid_cnic;
ALTER TABLE public.seller_profiles DROP CONSTRAINT IF EXISTS valid_cnic_format;
ALTER TABLE public.seller_profiles ADD CONSTRAINT valid_cnic_format CHECK (owner_cnic IS NULL OR owner_cnic ~ '^[0-9]{5}-[0-9]{7}-[0-9]{1}');

-- 10. Comments
COMMENT ON CONSTRAINT valid_phone_format ON public.users IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_email_format ON public.users IS 'Validates email format';
COMMENT ON CONSTRAINT valid_seller_phone_format ON public.seller_profiles IS 'Validates Pakistani mobile phone format (03XX XXXXXXX)';
COMMENT ON CONSTRAINT valid_seller_email_format ON public.seller_profiles IS 'Validates email format';
COMMENT ON CONSTRAINT valid_cnic_format ON public.seller_profiles IS 'Validates Pakistani CNIC format (XXXXX-XXXXXXX-X)';

-- 11. Helper: check_user_uniqueness
CREATE OR REPLACE FUNCTION public.check_user_uniqueness(
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_existing_user_id UUID DEFAULT NULL
)
RETURNS TABLE(is_valid BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_email IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM public.users WHERE email = p_email AND (p_existing_user_id IS NULL OR id != p_existing_user_id)) THEN
            RETURN QUERY SELECT FALSE, 'Email address is already registered';
            RETURN;
        END IF;
    END IF;

    IF p_phone IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM public.users WHERE phone = p_phone AND (p_existing_user_id IS NULL OR id != p_existing_user_id)) THEN
            RETURN QUERY SELECT FALSE, 'Phone number is already registered';
            RETURN;
        END IF;
    END IF;

    RETURN QUERY SELECT TRUE, NULL;
END;
$$;

-- 12. Helper: check_seller_uniqueness
CREATE OR REPLACE FUNCTION public.check_seller_uniqueness(
    p_username TEXT,
    p_cnic TEXT,
    p_existing_seller_id UUID DEFAULT NULL
)
RETURNS TABLE(is_valid BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.seller_profiles WHERE username = p_username AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)) THEN
        RETURN QUERY SELECT FALSE, 'Username is already taken';
        RETURN;
    END IF;

    IF p_cnic IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM public.seller_profiles WHERE owner_cnic = p_cnic AND (p_existing_seller_id IS NULL OR id != p_existing_seller_id)) THEN
            RETURN QUERY SELECT FALSE, 'CNIC number is already registered';
            RETURN;
        END IF;
    END IF;

    RETURN QUERY SELECT TRUE, NULL;
END;
$$;

-- 13. register_user_with_validation
CREATE OR REPLACE FUNCTION public.register_user_with_validation(
    p_email TEXT,
    p_phone TEXT,
    p_name TEXT,
    p_city TEXT,
    p_role TEXT DEFAULT 'user'
)
RETURNS TABLE(success BOOLEAN, user_id UUID, error_message TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
    v_is_valid BOOLEAN;
    v_error_message TEXT;
BEGIN
    IF p_email IS NULL OR p_email = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Email is required';
        RETURN;
    END IF;
    IF p_phone IS NULL OR p_phone = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Phone number is required';
        RETURN;
    END IF;
    IF p_name IS NULL OR p_name = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Name is required';
        RETURN;
    END IF;

    SELECT is_valid, error_message INTO v_is_valid, v_error_message FROM public.check_user_uniqueness(p_email, p_phone);
    IF NOT v_is_valid THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, v_error_message;
        RETURN;
    END IF;

    v_user_id := uuid_generate_v4();

    INSERT INTO public.users (id, email, phone, name, city, role, email_verified, phone_verified, is_verified)
    VALUES (v_user_id, p_email, p_phone, p_name, p_city, p_role, FALSE, FALSE, FALSE);

    RETURN QUERY SELECT TRUE, v_user_id, NULL;

EXCEPTION
    WHEN unique_violation THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'User with this email or phone already exists';
    WHEN check_violation THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Invalid email or phone format';
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Registration failed: ' || SQLERRM;
END;
$$ SECURITY DEFINER;

-- 14. register_seller_with_validation
CREATE OR REPLACE FUNCTION public.register_seller_with_validation(
    p_email TEXT,
    p_phone TEXT,
    p_name TEXT,
    p_city TEXT,
    p_username TEXT,
    p_cnic TEXT,
    p_business_name TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, user_id UUID, error_message TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
    v_is_valid BOOLEAN;
    v_error_message TEXT;
BEGIN
    IF p_email IS NULL OR p_email = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Email is required';
        RETURN;
    END IF;
    IF p_phone IS NULL OR p_phone = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Phone number is required';
        RETURN;
    END IF;
    IF p_name IS NULL OR p_name = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Name is required';
        RETURN;
    END IF;
    IF p_username IS NULL OR p_username = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Username is required';
        RETURN;
    END IF;
    IF p_cnic IS NULL OR p_cnic = '' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'CNIC number is required';
        RETURN;
    END IF;

    SELECT is_valid, error_message INTO v_is_valid, v_error_message FROM public.check_user_uniqueness(p_email, p_phone);
    IF NOT v_is_valid THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, v_error_message;
        RETURN;
    END IF;

    SELECT is_valid, error_message INTO v_is_valid, v_error_message FROM public.check_seller_uniqueness(p_username, p_cnic);
    IF NOT v_is_valid THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, v_error_message;
        RETURN;
    END IF;

    v_user_id := uuid_generate_v4();

    INSERT INTO public.users (id, email, phone, name, city, role, email_verified, phone_verified, is_verified)
    VALUES (v_user_id, p_email, p_phone, p_name, p_city, 'seller', FALSE, FALSE, FALSE);

    INSERT INTO public.seller_profiles (id, username, business_name, owner_name, owner_cnic, city, phone, email, is_verified, verification_status)
    VALUES (v_user_id, p_username, p_business_name, p_name, p_cnic, p_city, p_phone, p_email, FALSE, 'pending');

    RETURN QUERY SELECT TRUE, v_user_id, NULL;

EXCEPTION
    WHEN unique_violation THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Seller with this email, phone, username, or CNIC already exists';
    WHEN check_violation THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Invalid data format provided';
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Seller registration failed: ' || SQLERRM;
END;
$$ SECURITY DEFINER;

-- 15. Comments for functions
COMMENT ON FUNCTION public.check_user_uniqueness IS 'Checks if a user email or phone is already registered';
COMMENT ON FUNCTION public.check_seller_uniqueness IS 'Checks if a seller username or CNIC is already registered';
COMMENT ON FUNCTION public.register_user_with_validation IS 'Registers a new user with validation and clear error messages';
COMMENT ON FUNCTION public.register_seller_with_validation IS 'Registers a new seller with validation and clear error messages';