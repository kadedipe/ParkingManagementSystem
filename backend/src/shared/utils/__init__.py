# ============================================================================
# Utils Package
# ============================================================================

"""
Utils package for the parking management system.

This package provides utility functions and helpers used across the entire
application, including ID generation, validation, date/time manipulation,
string operations, and more.
"""

from .id_generator import (
    IDGenerator,
    generate_uuid,
    generate_ulid,
    generate_short_id,
    generate_otp,
    generate_random_string,
    generate_order_number,
    generate_invoice_number,
    generate_reference_id,
    get_id_generator,
)

from .datetime_utils import (
    utc_now,
    now,
    to_utc,
    to_local,
    format_datetime,
    format_date,
    format_time,
    parse_datetime,
    parse_date,
    parse_time,
    date_range,
    time_ago,
    time_until,
    is_within_time_range,
    get_timezone,
    get_timezone_offset,
    get_day_of_week,
    get_week_number,
    get_quarter,
    get_fiscal_year,
    add_days,
    add_hours,
    add_minutes,
    add_seconds,
    subtract_days,
    subtract_hours,
    subtract_minutes,
    subtract_seconds,
    days_between,
    hours_between,
    minutes_between,
    seconds_between,
    datetime_range,
    is_weekend,
    is_holiday,
    get_next_weekday,
    get_previous_weekday,
    get_month_days,
    get_year_days,
    get_timezone_list,
    format_duration,
    parse_duration,
    date_time,
    datetime_utils,
)

from .validation import (
    validate_email,
    validate_phone,
    validate_license_plate,
    validate_vin,
    validate_password_strength,
    validate_url,
    validate_uuid,
    validate_ip_address,
    validate_mac_address,
    validate_date,
    validate_time,
    validate_datetime,
    validate_card_number,
    validate_expiry_date,
    validate_cvv,
    validate_postal_code,
    validate_state_code,
    validate_country_code,
    validate_currency_code,
    validate_language_code,
    validate_zip_code,
    validate_ssn,
    validate_ein,
    validate_dob,
    validate_credit_card,
    validate_bank_account,
    validate_routing_number,
    is_valid_email,
    is_valid_phone,
    is_valid_license_plate,
    is_valid_vin,
    is_valid_url,
    is_valid_uuid,
    is_valid_password,
    is_valid_ip,
    is_valid_postal_code,
    PasswordStrength,
    ValidationError,
    validate_with_regex,
    validate_length,
    validate_range,
    validate_enum,
    validate_unique,
    validate_required,
    validate_if,
    validate_condition,
    get_validator,
)

from .string_utils import (
    slugify,
    camel_to_snake,
    snake_to_camel,
    capitalize_words,
    remove_whitespace,
    normalize_string,
    truncate_string,
    mask_sensitive_data,
    sanitize_html,
    sanitize_filename,
    generate_slug,
    extract_domain,
    extract_numbers,
    extract_emails,
    extract_phones,
    extract_urls,
    extract_hashtags,
    extract_mentions,
    count_words,
    count_characters,
    count_lines,
    split_by_length,
    chunk_string,
    reverse_string,
    is_palindrome,
    is_anagram,
    levenshtein_distance,
    jaccard_similarity,
    cosine_similarity,
    soundex,
    metaphone,
    double_metaphone,
    is_empty,
    is_blank,
    is_null_or_empty,
    default_if_empty,
    coalesce,
    format_template,
    interpolate,
    replace_variables,
    parse_key_value_pairs,
    str_to_bool,
    bool_to_str,
    yes_no_to_bool,
    to_camel_case,
    to_snake_case,
    to_kebab_case,
    to_title_case,
    to_sentence_case,
    StringUtils,
)

from .crypto import (
    PasswordHasher,
    TokenManager,
    EncryptionManager,
    DecryptionManager,
    Signer,
    Verifier,
    hash_password,
    verify_password,
    generate_token,
    verify_token,
    encrypt_data,
    decrypt_data,
    sign_data,
    verify_signature,
    generate_salt,
    generate_hash,
    create_jwt,
    decode_jwt,
    secure_compare,
    get_random_bytes,
    get_random_int,
    get_random_float,
    CryptoUtils,
)

from .json_utils import (
    safe_json_loads,
    safe_json_dumps,
    json_serialize_datetime,
    json_deserialize_datetime,
    JSONEncoder,
    JSONDecoder,
    compact_json,
    pretty_json,
    minify_json,
    validate_json,
    is_valid_json,
    merge_json,
    diff_json,
    patch_json,
    json_path,
    jq,
    JSONUtils,
)

from .file_utils import (
    get_file_extension,
    get_mime_type,
    sanitize_filename,
    get_file_size,
    is_allowed_extension,
    is_allowed_file,
    is_image_file,
    is_video_file,
    is_audio_file,
    is_document_file,
    is_archive_file,
    read_file,
    write_file,
    delete_file,
    copy_file,
    move_file,
    create_directory,
    delete_directory,
    list_directory,
    get_file_hash,
    get_file_metadata,
    get_temp_file,
    save_upload_file,
    FileUtils,
)

from .math_utils import (
    calculate_percentage,
    round_decimal,
    format_currency,
    calculate_distance,
    calculate_duration,
    calculate_average,
    calculate_median,
    calculate_mode,
    calculate_standard_deviation,
    calculate_variance,
    calculate_correlation,
    calculate_regression,
    calculate_percentile,
    calculate_z_score,
    normalize_value,
    denormalize_value,
    clamp_value,
    lerp,
    map_range,
    random_number,
    random_between,
    random_int,
    random_float,
    random_choice,
    random_shuffle,
    random_seed,
    is_number,
    is_integer,
    is_float,
    is_even,
    is_odd,
    is_prime,
    is_power_of_two,
    gcd,
    lcm,
    factorial,
    fibonacci,
    MathUtils,
)

from .async_utils import (
    run_async,
    gather_with_concurrency,
    retry_async,
    timeout_async,
    delay_async,
    async_map,
    async_filter,
    async_reduce,
    async_for_each,
    async_pipe,
    async_compose,
    AsyncUtils,
)

from .cache_utils import (
    CacheManager,
    cached,
    cache_async,
    invalidate_cache,
    get_cache_key,
    build_cache_key,
    CacheUtils,
)

from .decorators import (
    retry,
    retry_async,
    timeout,
    timeout_async,
    cached,
    rate_limit,
    log,
    measure_time,
    handle_exceptions,
    require_permission,
    require_role,
    transactional,
    memoize,
    singleton,
    deprecate,
    suppress_errors,
    with_context,
    with_user,
    with_session,
    Decorators,
)


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # ID Generator
    "IDGenerator",
    "generate_uuid",
    "generate_ulid",
    "generate_short_id",
    "generate_otp",
    "generate_random_string",
    "generate_order_number",
    "generate_invoice_number",
    "generate_reference_id",
    "get_id_generator",
    
    # Datetime Utils
    "utc_now",
    "now",
    "to_utc",
    "to_local",
    "format_datetime",
    "format_date",
    "format_time",
    "parse_datetime",
    "parse_date",
    "parse_time",
    "date_range",
    "time_ago",
    "time_until",
    "is_within_time_range",
    "get_timezone",
    "get_timezone_offset",
    "get_day_of_week",
    "get_week_number",
    "get_quarter",
    "get_fiscal_year",
    "add_days",
    "add_hours",
    "add_minutes",
    "add_seconds",
    "subtract_days",
    "subtract_hours",
    "subtract_minutes",
    "subtract_seconds",
    "days_between",
    "hours_between",
    "minutes_between",
    "seconds_between",
    "datetime_range",
    "is_weekend",
    "is_holiday",
    "get_next_weekday",
    "get_previous_weekday",
    "get_month_days",
    "get_year_days",
    "get_timezone_list",
    "format_duration",
    "parse_duration",
    "date_time",
    "datetime_utils",
    
    # Validation
    "validate_email",
    "validate_phone",
    "validate_license_plate",
    "validate_vin",
    "validate_password_strength",
    "validate_url",
    "validate_uuid",
    "validate_ip_address",
    "validate_mac_address",
    "validate_date",
    "validate_time",
    "validate_datetime",
    "validate_card_number",
    "validate_expiry_date",
    "validate_cvv",
    "validate_postal_code",
    "validate_state_code",
    "validate_country_code",
    "validate_currency_code",
    "validate_language_code",
    "validate_zip_code",
    "validate_ssn",
    "validate_ein",
    "validate_dob",
    "validate_credit_card",
    "validate_bank_account",
    "validate_routing_number",
    "is_valid_email",
    "is_valid_phone",
    "is_valid_license_plate",
    "is_valid_vin",
    "is_valid_url",
    "is_valid_uuid",
    "is_valid_password",
    "is_valid_ip",
    "is_valid_postal_code",
    "PasswordStrength",
    "ValidationError",
    "validate_with_regex",
    "validate_length",
    "validate_range",
    "validate_enum",
    "validate_unique",
    "validate_required",
    "validate_if",
    "validate_condition",
    "get_validator",
    
    # String Utils
    "slugify",
    "camel_to_snake",
    "snake_to_camel",
    "capitalize_words",
    "remove_whitespace",
    "normalize_string",
    "truncate_string",
    "mask_sensitive_data",
    "sanitize_html",
    "sanitize_filename",
    "generate_slug",
    "extract_domain",
    "extract_numbers",
    "extract_emails",
    "extract_phones",
    "extract_urls",
    "extract_hashtags",
    "extract_mentions",
    "count_words",
    "count_characters",
    "count_lines",
    "split_by_length",
    "chunk_string",
    "reverse_string",
    "is_palindrome",
    "is_anagram",
    "levenshtein_distance",
    "jaccard_similarity",
    "cosine_similarity",
    "soundex",
    "metaphone",
    "double_metaphone",
    "is_empty",
    "is_blank",
    "is_null_or_empty",
    "default_if_empty",
    "coalesce",
    "format_template",
    "interpolate",
    "replace_variables",
    "parse_key_value_pairs",
    "str_to_bool",
    "bool_to_str",
    "yes_no_to_bool",
    "to_camel_case",
    "to_snake_case",
    "to_kebab_case",
    "to_title_case",
    "to_sentence_case",
    "StringUtils",
    
    # Crypto
    "PasswordHasher",
    "TokenManager",
    "EncryptionManager",
    "DecryptionManager",
    "Signer",
    "Verifier",
    "hash_password",
    "verify_password",
    "generate_token",
    "verify_token",
    "encrypt_data",
    "decrypt_data",
    "sign_data",
    "verify_signature",
    "generate_salt",
    "generate_hash",
    "create_jwt",
    "decode_jwt",
    "secure_compare",
    "get_random_bytes",
    "get_random_int",
    "get_random_float",
    "CryptoUtils",
    
    # JSON Utils
    "safe_json_loads",
    "safe_json_dumps",
    "json_serialize_datetime",
    "json_deserialize_datetime",
    "JSONEncoder",
    "JSONDecoder",
    "compact_json",
    "pretty_json",
    "minify_json",
    "validate_json",
    "is_valid_json",
    "merge_json",
    "diff_json",
    "patch_json",
    "json_path",
    "jq",
    "JSONUtils",
    
    # File Utils
    "get_file_extension",
    "get_mime_type",
    "sanitize_filename",
    "get_file_size",
    "is_allowed_extension",
    "is_allowed_file",
    "is_image_file",
    "is_video_file",
    "is_audio_file",
    "is_document_file",
    "is_archive_file",
    "read_file",
    "write_file",
    "delete_file",
    "copy_file",
    "move_file",
    "create_directory",
    "delete_directory",
    "list_directory",
    "get_file_hash",
    "get_file_metadata",
    "get_temp_file",
    "save_upload_file",
    "FileUtils",
    
    # Math Utils
    "calculate_percentage",
    "round_decimal",
    "format_currency",
    "calculate_distance",
    "calculate_duration",
    "calculate_average",
    "calculate_median",
    "calculate_mode",
    "calculate_standard_deviation",
    "calculate_variance",
    "calculate_correlation",
    "calculate_regression",
    "calculate_percentile",
    "calculate_z_score",
    "normalize_value",
    "denormalize_value",
    "clamp_value",
    "lerp",
    "map_range",
    "random_number",
    "random_between",
    "random_int",
    "random_float",
    "random_choice",
    "random_shuffle",
    "random_seed",
    "is_number",
    "is_integer",
    "is_float",
    "is_even",
    "is_odd",
    "is_prime",
    "is_power_of_two",
    "gcd",
    "lcm",
    "factorial",
    "fibonacci",
    "MathUtils",
    
    # Async Utils
    "run_async",
    "gather_with_concurrency",
    "retry_async",
    "timeout_async",
    "delay_async",
    "async_map",
    "async_filter",
    "async_reduce",
    "async_for_each",
    "async_pipe",
    "async_compose",
    "AsyncUtils",
    
    # Cache Utils
    "CacheManager",
    "cached",
    "cache_async",
    "invalidate_cache",
    "get_cache_key",
    "build_cache_key",
    "CacheUtils",
    
    # Decorators
    "retry",
    "retry_async",
    "timeout",
    "timeout_async",
    "cached",
    "rate_limit",
    "log",
    "measure_time",
    "handle_exceptions",
    "require_permission",
    "require_role",
    "transactional",
    "memoize",
    "singleton",
    "deprecate",
    "suppress_errors",
    "with_context",
    "with_user",
    "with_session",
    "Decorators",
]


# ============================================================================
# Package Version
# ============================================================================

__version__ = "1.0.0"


# ============================================================================
# Package Initialization
# ============================================================================

import logging
from .id_generator import get_id_generator
from .datetime_utils import datetime_utils
from .validation import get_validator
from .string_utils import StringUtils
from .crypto import CryptoUtils
from .json_utils import JSONUtils
from .file_utils import FileUtils
from .math_utils import MathUtils
from .async_utils import AsyncUtils
from .cache_utils import CacheUtils
from .decorators import Decorators

# Get package logger
_logger = logging.getLogger(__name__)


def initialize_utils():
    """
    Initialize the utils package.
    
    Returns:
        dict: Initialized utilities
    """
    try:
        utils = {
            "id_generator": get_id_generator(),
            "datetime_utils": datetime_utils,
            "validation": get_validator(),
            "string_utils": StringUtils(),
            "crypto": CryptoUtils(),
            "json_utils": JSONUtils(),
            "file_utils": FileUtils(),
            "math_utils": MathUtils(),
            "async_utils": AsyncUtils(),
            "cache_utils": CacheUtils(),
            "decorators": Decorators(),
        }
        
        _logger.info(f"Utils package initialized v{__version__}")
        _logger.info(f"Loaded {len(utils)} utility modules")
        
        return utils
    except Exception as e:
        _logger.error(f"Failed to initialize utils package: {e}", exc_info=True)
        return {}


def get_utils_info() -> dict:
    """
    Get utils package information.
    
    Returns:
        dict: Package information
    """
    return {
        "name": "utils",
        "version": __version__,
        "description": "Utility functions and helpers for the parking management system",
        "modules": [
            "id_generator",
            "datetime_utils",
            "validation",
            "string_utils",
            "crypto",
            "json_utils",
            "file_utils",
            "math_utils",
            "async_utils",
            "cache_utils",
            "decorators",
        ],
        "features": [
            "ID generation",
            "Date/time manipulation",
            "Validation",
            "String operations",
            "Cryptography",
            "JSON handling",
            "File operations",
            "Math utilities",
            "Async helpers",
            "Caching",
            "Decorators",
        ],
    }


# Initialize utils
_utils = initialize_utils()


# ============================================================================
# Convenience Functions
# ============================================================================

def get_version() -> str:
    """Get the package version."""
    return __version__


def get_utils() -> dict:
    """
    Get all initialized utilities.
    
    Returns:
        dict: Dictionary of utility instances
    """
    return _utils.copy()


def get_utility(name: str):
    """
    Get a specific utility instance.
    
    Args:
        name: Utility name
        
    Returns:
        object: Utility instance
    """
    return _utils.get(name)


# ============================================================================
# Package Documentation
# ============================================================================

"""
Utils Package Documentation
===========================

The utils package provides utility functions and helpers used across the
entire parking management system.

Modules:
--------

1. **id_generator**: ID generation utilities
   - UUID, ULID, short ID generation
   - OTP and random string generation
   - Order and invoice number generation

2. **datetime_utils**: Date/time manipulation
   - UTC and timezone handling
   - Formatting and parsing
   - Date ranges and calculations
   - Weekend and holiday detection

3. **validation**: Validation utilities
   - Email, phone, license plate validation
   - Password strength validation
   - Credit card and bank account validation
   - Custom validation functions

4. **string_utils**: String manipulation
   - Slug generation
   - Case conversion
   - Text extraction and analysis
   - Similarity metrics

5. **crypto**: Cryptography utilities
   - Password hashing and verification
   - Token generation and validation
   - Encryption and decryption
   - JWT handling

6. **json_utils**: JSON handling
   - Safe parsing and serialization
   - JSON comparison and patching
   - JSON querying (JSONPath, jq)

7. **file_utils**: File operations
   - File type detection
   - File reading/writing
   - File management
   - Upload handling

8. **math_utils**: Mathematical utilities
   - Percentage and currency calculations
   - Statistical calculations
   - Random number generation
   - Number validation

9. **async_utils**: Async helpers
   - Async function wrappers
   - Concurrency control
   - Retry and timeout handling

10. **cache_utils**: Caching utilities
    - Cache management
    - Decorator-based caching
    - Cache key generation

11. **decorators**: Common decorators
    - Retry logic
    - Timeout handling
    - Rate limiting
    - Performance measurement
    - Permission checking

Quick Start:
-----------
```python
from src.shared.utils import (
    generate_uuid,
    utc_now,
    validate_email,
    slugify,
    hash_password,
    safe_json_loads,
    get_file_extension,
    calculate_percentage,
)

# Generate UUID
id = generate_uuid()

# Get current UTC time
now = utc_now()

# Validate email
if validate_email("test@example.com"):
    # Valid email
    pass

# Create slug
slug = slugify("Hello World")  # "hello-world"

# Hash password
hashed = hash_password("my_password")

# Parse JSON safely
data = safe_json_loads('{"key": "value"}')

# Calculate percentage
result = calculate_percentage(75, 100)  # 75.0