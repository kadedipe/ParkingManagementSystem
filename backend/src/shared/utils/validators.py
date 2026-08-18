# ============================================================================
# Validators Module
# ============================================================================

"""
Validators module for the parking management system.

This module provides comprehensive validation functions for various data types
including email, phone, license plates, VIN, passwords, and more.
"""

import re
import uuid
import string
from typing import Optional, Union, List, Dict, Any, Tuple, Pattern
from datetime import datetime, date, time
from enum import Enum
from functools import lru_cache
from decimal import Decimal

from .string_utils import normalize_string, remove_whitespace


# ============================================================================
# Constants and Patterns
# ============================================================================

# Email pattern
EMAIL_REGEX = re.compile(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
)

# Phone number patterns (international)
PHONE_REGEX = re.compile(
    r'^\+?[1-9]\d{1,14}$'  # E.164 format
)

# US Phone number pattern
US_PHONE_REGEX = re.compile(
    r'^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$'
)

# License plate patterns (US variations)
LICENSE_PLATE_REGEX = re.compile(
    r'^[A-Z0-9]{1,8}$'
)

# VIN pattern (17 characters, no I, O, Q)
VIN_REGEX = re.compile(
    r'^[A-HJ-NPR-Z0-9]{17}$'
)

# URL pattern
URL_REGEX = re.compile(
    r'^https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+(?::\d+)?(?:/[-\w%_.~+]*)*(?:\?[-\w%_.~+=&]*)?(?:#[-\w_]*)?$'
)

# UUID pattern
UUID_REGEX = re.compile(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
)

# IP address patterns
IPV4_REGEX = re.compile(
    r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
)
IPV6_REGEX = re.compile(
    r'^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$'
)

# MAC address pattern
MAC_REGEX = re.compile(
    r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'
)

# Postal/ZIP code patterns
US_ZIP_REGEX = re.compile(r'^\d{5}(-\d{4})?$')
UK_POSTCODE_REGEX = re.compile(r'^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$')
CA_POSTAL_REGEX = re.compile(r'^[A-Z]\d[A-Z] ?\d[A-Z]\d$')

# Credit card patterns
CARD_PATTERNS = {
    'visa': re.compile(r'^4[0-9]{12}(?:[0-9]{3})?$'),
    'mastercard': re.compile(r'^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$'),
    'amex': re.compile(r'^3[47][0-9]{13}$'),
    'discover': re.compile(r'^6(?:011|5[0-9]{2})[0-9]{12}$'),
    'diners': re.compile(r'^3(?:0[0-5]|[68][0-9])[0-9]{11}$'),
    'jcb': re.compile(r'^(?:2131|1800|35\d{3})\d{11}$'),
}

# State codes (US)
US_STATE_CODES = {
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
}

# Country codes (ISO 3166-1 alpha-2)
COUNTRY_CODES = {
    'AF', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR',
    'AM', 'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY',
    'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV',
    'BR', 'IO', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA',
    'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM', 'CG',
    'CD', 'CK', 'CR', 'HR', 'CU', 'CW', 'CY', 'CZ', 'CI', 'DK',
    'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ',
    'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA',
    'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU',
    'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HM', 'VA', 'HN', 'HK',
    'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT',
    'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW',
    'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU',
    'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR',
    'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA',
    'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE',
    'NG', 'NU', 'NF', 'MK', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS',
    'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA',
    'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM',
    'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG',
    'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'SS', 'ES', 'LK',
    'SD', 'SR', 'SJ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH',
    'TL', 'TG', 'TK', 'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV',
    'UG', 'UA', 'AE', 'GB', 'US', 'UM', 'UY', 'UZ', 'VU', 'VE',
    'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW'
}

# Currency codes (ISO 4217)
CURRENCY_CODES = {
    'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN',
    'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL',
    'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY',
    'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD',
    'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GHS', 'GIP',
    'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR',
    'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 'JPY',
    'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK',
    'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK',
    'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD',
    'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP',
    'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD',
    'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STN',
    'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD',
    'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST',
    'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWL'
}

# Language codes (ISO 639-1)
LANGUAGE_CODES = {
    'ab', 'aa', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'av', 'ae',
    'ay', 'az', 'bm', 'ba', 'eu', 'be', 'bn', 'bi', 'bs', 'br', 'bg', 'my',
    'ca', 'ch', 'ce', 'ny', 'zh', 'cu', 'cv', 'kw', 'co', 'cr', 'hr', 'cs',
    'da', 'dv', 'nl', 'dz', 'en', 'eo', 'et', 'ee', 'fo', 'fj', 'fi', 'fr',
    'ff', 'gd', 'gl', 'lg', 'ka', 'de', 'el', 'gn', 'gu', 'ht', 'ha', 'he',
    'hz', 'hi', 'ho', 'hu', 'is', 'io', 'ig', 'id', 'ia', 'ie', 'iu', 'ik',
    'ga', 'it', 'ja', 'jv', 'kl', 'kn', 'kr', 'ks', 'kk', 'km', 'ki', 'rw',
    'ky', 'kv', 'kg', 'ko', 'kj', 'ku', 'lo', 'la', 'lv', 'li', 'ln', 'lt',
    'lu', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'gv', 'mi', 'mr', 'mh', 'mn',
    'na', 'nv', 'nd', 'ne', 'ng', 'nb', 'nn', 'no', 'ii', 'nr', 'oc', 'oj',
    'om', 'or', 'os', 'pa', 'ps', 'fa', 'pl', 'pt', 'qu', 'ro', 'rm', 'rn',
    'ru', 'se', 'sm', 'sg', 'sa', 'sc', 'sr', 'sn', 'sd', 'si', 'sk', 'sl',
    'so', 'st', 'es', 'su', 'sw', 'ss', 'sv', 'tl', 'ty', 'tg', 'ta', 'tt',
    'te', 'th', 'bo', 'ti', 'to', 'ts', 'tn', 'tr', 'tk', 'tw', 'ug', 'uk',
    'ur', 'uz', 've', 'vi', 'vo', 'wa', 'cy', 'wo', 'fy', 'xh', 'yi', 'yo',
    'za', 'zu'
}


# ============================================================================
# Password Strength Enum
# ============================================================================

class PasswordStrength(str, Enum):
    """Password strength levels."""
    WEAK = "weak"
    MEDIUM = "medium"
    STRONG = "strong"
    VERY_STRONG = "very_strong"


# ============================================================================
# Validation Error
# ============================================================================

class ValidationError(Exception):
    """Exception raised for validation errors."""
    
    def __init__(self, message: str, field: Optional[str] = None, code: Optional[str] = None):
        """
        Initialize validation error.
        
        Args:
            message: Error message
            field: Field name that caused the error
            code: Error code
        """
        self.message = message
        self.field = field
        self.code = code
        super().__init__(message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        result = {"message": self.message}
        if self.field:
            result["field"] = self.field
        if self.code:
            result["code"] = self.code
        return result


# ============================================================================
# Validation Functions
# ============================================================================

@lru_cache(maxsize=1000)
def validate_email(email: str) -> bool:
    """
    Validate email address.
    
    Args:
        email: Email address to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


@lru_cache(maxsize=1000)
def validate_phone(phone: str, country: str = "US") -> bool:
    """
    Validate phone number.
    
    Args:
        phone: Phone number to validate
        country: Country code (default: US)
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not phone or not isinstance(phone, str):
        return False
    
    phone = remove_whitespace(phone)
    
    # E.164 format validation
    if phone.startswith('+'):
        return bool(PHONE_REGEX.match(phone))
    
    # US phone number validation
    if country == "US":
        return bool(US_PHONE_REGEX.match(phone))
    
    # Generic validation (remove non-digits and check length)
    digits = re.sub(r'\D', '', phone)
    return 7 <= len(digits) <= 15


@lru_cache(maxsize=1000)
def validate_license_plate(plate: str, country: str = "US") -> bool:
    """
    Validate license plate number.
    
    Args:
        plate: License plate to validate
        country: Country code (default: US)
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not plate or not isinstance(plate, str):
        return False
    
    plate = remove_whitespace(plate).upper()
    
    # US basic validation
    if country == "US":
        return bool(LICENSE_PLATE_REGEX.match(plate))
    
    # Generic validation (alphanumeric, 1-8 characters)
    return bool(re.match(r'^[A-Z0-9]{1,8}$', plate))


@lru_cache(maxsize=1000)
def validate_vin(vin: str) -> bool:
    """
    Validate Vehicle Identification Number (VIN).
    
    Args:
        vin: VIN to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not vin or not isinstance(vin, str):
        return False
    
    vin = vin.upper().strip()
    
    # Basic format check
    if not VIN_REGEX.match(vin):
        return False
    
    # Check VIN checksum (for 17-character VINs)
    if len(vin) == 17:
        return _validate_vin_checksum(vin)
    
    return True


def _validate_vin_checksum(vin: str) -> bool:
    """
    Validate VIN checksum.
    
    Args:
        vin: 17-character VIN
        
    Returns:
        bool: True if checksum is valid
    """
    # VIN character values
    values = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
        'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
    }
    
    # Position weights
    weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
    
    # Calculate checksum
    total = 0
    for i, char in enumerate(vin):
        if char in values:
            total += values[char] * weights[i]
    
    # Check digit
    check_digit = total % 11
    check_digit_str = str(check_digit) if check_digit < 10 else 'X'
    
    return vin[8] == check_digit_str


@lru_cache(maxsize=1000)
def validate_url(url: str) -> bool:
    """
    Validate URL.
    
    Args:
        url: URL to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not url or not isinstance(url, str):
        return False
    return bool(URL_REGEX.match(url.strip()))


@lru_cache(maxsize=1000)
def validate_uuid(uuid_str: str, version: Optional[int] = None) -> bool:
    """
    Validate UUID.
    
    Args:
        uuid_str: UUID string to validate
        version: UUID version (1, 3, 4, 5)
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not uuid_str or not isinstance(uuid_str, str):
        return False
    
    try:
        uuid_obj = uuid.UUID(uuid_str)
        if version is not None:
            return uuid_obj.version == version
        return True
    except ValueError:
        return False


@lru_cache(maxsize=1000)
def validate_ip_address(ip: str) -> bool:
    """
    Validate IP address (IPv4 or IPv6).
    
    Args:
        ip: IP address to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not ip or not isinstance(ip, str):
        return False
    
    return bool(IPV4_REGEX.match(ip)) or bool(IPV6_REGEX.match(ip))


@lru_cache(maxsize=1000)
def validate_mac_address(mac: str) -> bool:
    """
    Validate MAC address.
    
    Args:
        mac: MAC address to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not mac or not isinstance(mac, str):
        return False
    return bool(MAC_REGEX.match(mac.strip()))


@lru_cache(maxsize=1000)
def validate_postal_code(postal_code: str, country: str = "US") -> bool:
    """
    Validate postal/ZIP code.
    
    Args:
        postal_code: Postal code to validate
        country: Country code (default: US)
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not postal_code or not isinstance(postal_code, str):
        return False
    
    postal_code = postal_code.strip()
    
    if country == "US":
        return bool(US_ZIP_REGEX.match(postal_code))
    elif country == "GB" or country == "UK":
        return bool(UK_POSTCODE_REGEX.match(postal_code.upper()))
    elif country == "CA":
        return bool(CA_POSTAL_REGEX.match(postal_code.upper()))
    
    # Generic validation (alphanumeric with spaces/hyphens)
    return bool(re.match(r'^[A-Z0-9\s\-]{3,10}$', postal_code.upper()))


@lru_cache(maxsize=1000)
def validate_state_code(state: str) -> bool:
    """
    Validate US state code.
    
    Args:
        state: State code to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not state or not isinstance(state, str):
        return False
    return state.upper() in US_STATE_CODES


@lru_cache(maxsize=1000)
def validate_country_code(country: str) -> bool:
    """
    Validate country code (ISO 3166-1 alpha-2).
    
    Args:
        country: Country code to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not country or not isinstance(country, str):
        return False
    return country.upper() in COUNTRY_CODES


@lru_cache(maxsize=1000)
def validate_currency_code(currency: str) -> bool:
    """
    Validate currency code (ISO 4217).
    
    Args:
        currency: Currency code to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not currency or not isinstance(currency, str):
        return False
    return currency.upper() in CURRENCY_CODES


@lru_cache(maxsize=1000)
def validate_language_code(language: str) -> bool:
    """
    Validate language code (ISO 639-1).
    
    Args:
        language: Language code to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not language or not isinstance(language, str):
        return False
    return language.lower() in LANGUAGE_CODES


@lru_cache(maxsize=1000)
def validate_credit_card(card_number: str) -> Tuple[bool, Optional[str]]:
    """
    Validate credit card number and return card type.
    
    Args:
        card_number: Credit card number
        
    Returns:
        Tuple[bool, Optional[str]]: (is_valid, card_type)
    """
    if not card_number or not isinstance(card_number, str):
        return False, None
    
    # Remove spaces and dashes
    card_number = re.sub(r'[\s\-]', '', card_number)
    
    # Check length
    if not (13 <= len(card_number) <= 19):
        return False, None
    
    # Luhn algorithm check
    if not _validate_luhn(card_number):
        return False, None
    
    # Check card type
    for card_type, pattern in CARD_PATTERNS.items():
        if pattern.match(card_number):
            return True, card_type
    
    return True, None


def _validate_luhn(card_number: str) -> bool:
    """
    Validate credit card number using Luhn algorithm.
    
    Args:
        card_number: Credit card number
        
    Returns:
        bool: True if valid
    """
    total = 0
    is_even = False
    
    # Process from right to left
    for i in range(len(card_number) - 1, -1, -1):
        digit = int(card_number[i])
        
        if is_even:
            digit *= 2
            if digit > 9:
                digit -= 9
        
        total += digit
        is_even = not is_even
    
    return total % 10 == 0


@lru_cache(maxsize=1000)
def validate_expiry_date(month: int, year: int) -> bool:
    """
    Validate credit card expiry date.
    
    Args:
        month: Expiry month (1-12)
        year: Expiry year (4 digits)
        
    Returns:
        bool: True if valid
    """
    if not (1 <= month <= 12):
        return False
    
    if year < 2000 or year > 2100:
        return False
    
    # Check if not expired
    now = datetime.now()
    if year < now.year:
        return False
    if year == now.year and month < now.month:
        return False
    
    return True


@lru_cache(maxsize=1000)
def validate_cvv(cvv: str, card_type: Optional[str] = None) -> bool:
    """
    Validate CVV/CVC code.
    
    Args:
        cvv: CVV code
        card_type: Card type (amex has 4 digits, others 3)
        
    Returns:
        bool: True if valid
    """
    if not cvv or not isinstance(cvv, str):
        return False
    
    cvv = cvv.strip()
    
    if card_type == 'amex':
        return bool(re.match(r'^\d{4}$', cvv))
    else:
        return bool(re.match(r'^\d{3,4}$', cvv))


@lru_cache(maxsize=1000)
def validate_password_strength(password: str) -> PasswordStrength:
    """
    Validate password strength.
    
    Args:
        password: Password to validate
        
    Returns:
        PasswordStrength: Password strength level
    """
    if not password:
        return PasswordStrength.WEAK
    
    score = 0
    
    # Length checks
    if len(password) >= 8:
        score += 1
    if len(password) >= 12:
        score += 1
    if len(password) >= 16:
        score += 1
    
    # Character variety checks
    has_upper = bool(re.search(r'[A-Z]', password))
    has_lower = bool(re.search(r'[a-z]', password))
    has_digit = bool(re.search(r'\d', password))
    has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
    
    if has_upper:
        score += 1
    if has_lower:
        score += 1
    if has_digit:
        score += 1
    if has_special:
        score += 1
    
    # Determine strength
    if score <= 2:
        return PasswordStrength.WEAK
    elif score <= 4:
        return PasswordStrength.MEDIUM
    elif score <= 6:
        return PasswordStrength.STRONG
    else:
        return PasswordStrength.VERY_STRONG


@lru_cache(maxsize=1000)
def validate_date(date_str: str, format: str = "%Y-%m-%d") -> bool:
    """
    Validate date string.
    
    Args:
        date_str: Date string to validate
        format: Date format
        
    Returns:
        bool: True if valid
    """
    if not date_str or not isinstance(date_str, str):
        return False
    
    try:
        datetime.strptime(date_str, format)
        return True
    except ValueError:
        return False


@lru_cache(maxsize=1000)
def validate_time(time_str: str, format: str = "%H:%M:%S") -> bool:
    """
    Validate time string.
    
    Args:
        time_str: Time string to validate
        format: Time format
        
    Returns:
        bool: True if valid
    """
    if not time_str or not isinstance(time_str, str):
        return False
    
    try:
        datetime.strptime(time_str, format)
        return True
    except ValueError:
        return False


@lru_cache(maxsize=1000)
def validate_datetime(datetime_str: str, format: str = "%Y-%m-%d %H:%M:%S") -> bool:
    """
    Validate datetime string.
    
    Args:
        datetime_str: Datetime string to validate
        format: Datetime format
        
    Returns:
        bool: True if valid
    """
    if not datetime_str or not isinstance(datetime_str, str):
        return False
    
    try:
        datetime.strptime(datetime_str, format)
        return True
    except ValueError:
        return False


def validate_with_regex(value: str, pattern: Union[str, Pattern]) -> bool:
    """
    Validate value against a regex pattern.
    
    Args:
        value: Value to validate
        pattern: Regex pattern
        
    Returns:
        bool: True if valid
    """
    if not value:
        return False
    
    if isinstance(pattern, str):
        pattern = re.compile(pattern)
    
    return bool(pattern.match(value))


def validate_length(value: Union[str, list], min_length: int = 0, max_length: Optional[int] = None) -> bool:
    """
    Validate length of string or list.
    
    Args:
        value: Value to validate
        min_length: Minimum length
        max_length: Maximum length
        
    Returns:
        bool: True if valid
    """
    if value is None:
        return min_length == 0
    
    length = len(value)
    
    if length < min_length:
        return False
    
    if max_length is not None and length > max_length:
        return False
    
    return True


def validate_range(value: Union[int, float, Decimal], min_value: Optional[Union[int, float, Decimal]] = None, max_value: Optional[Union[int, float, Decimal]] = None) -> bool:
    """
    Validate numeric range.
    
    Args:
        value: Value to validate
        min_value: Minimum value
        max_value: Maximum value
        
    Returns:
        bool: True if valid
    """
    if value is None:
        return False
    
    if min_value is not None and value < min_value:
        return False
    
    if max_value is not None and value > max_value:
        return False
    
    return True


def validate_enum(value: Any, enum_class: type) -> bool:
    """
    Validate value against an Enum.
    
    Args:
        value: Value to validate
        enum_class: Enum class
        
    Returns:
        bool: True if valid
    """
    if value is None:
        return False
    
    try:
        return value in enum_class.__members__.values()
    except (AttributeError, TypeError):
        return False


def validate_required(value: Any) -> bool:
    """
    Validate required field (not None, not empty).
    
    Args:
        value: Value to validate
        
    Returns:
        bool: True if valid
    """
    if value is None:
        return False
    
    if isinstance(value, str) and not value.strip():
        return False
    
    if isinstance(value, (list, dict)) and not value:
        return False
    
    return True


# ============================================================================
# Convenience Functions
# ============================================================================

def is_valid_email(email: str) -> bool:
    """Check if email is valid."""
    return validate_email(email)


def is_valid_phone(phone: str, country: str = "US") -> bool:
    """Check if phone number is valid."""
    return validate_phone(phone, country)


def is_valid_license_plate(plate: str, country: str = "US") -> bool:
    """Check if license plate is valid."""
    return validate_license_plate(plate, country)


def is_valid_vin(vin: str) -> bool:
    """Check if VIN is valid."""
    return validate_vin(vin)


def is_valid_url(url: str) -> bool:
    """Check if URL is valid."""
    return validate_url(url)


def is_valid_uuid(uuid_str: str, version: Optional[int] = None) -> bool:
    """Check if UUID is valid."""
    return validate_uuid(uuid_str, version)


def is_valid_password(password: str, min_strength: PasswordStrength = PasswordStrength.MEDIUM) -> bool:
    """
    Check if password meets minimum strength.
    
    Args:
        password: Password to check
        min_strength: Minimum required strength
        
    Returns:
        bool: True if password meets requirements
    """
    strength = validate_password_strength(password)
    strength_order = list(PasswordStrength)
    return strength_order.index(strength) >= strength_order.index(min_strength)


def is_valid_ip(ip: str) -> bool:
    """Check if IP address is valid."""
    return validate_ip_address(ip)


def is_valid_postal_code(postal_code: str, country: str = "US") -> bool:
    """Check if postal code is valid."""
    return validate_postal_code(postal_code, country)


# ============================================================================
# Validator Class
# ============================================================================

class Validator:
    """
    Comprehensive validator class with chainable validation.
    """
    
    def __init__(self):
        self._errors: List[Dict[str, Any]] = []
        self._valid = True
    
    def validate(self, value: Any, validators: List[Dict[str, Any]]) -> 'Validator':
        """
        Run multiple validators on a value.
        
        Args:
            value: Value to validate
            validators: List of validator configurations
            
        Returns:
            Validator: Self for chaining
        """
        for validator_config in validators:
            validator_name = validator_config.get('name')
            validator_func = validator_config.get('func')
            params = validator_config.get('params', {})
            field = validator_config.get('field', 'unknown')
            
            if validator_func:
                try:
                    result = validator_func(value, **params)
                    if not result:
                        error_msg = validator_config.get('message', f'Validation failed for {field}')
                        self._add_error(error_msg, field)
                except Exception as e:
                    self._add_error(str(e), field)
        
        return self
    
    def is_valid(self) -> bool:
        """Check if all validations passed."""
        return self._valid
    
    def get_errors(self) -> List[Dict[str, Any]]:
        """Get validation errors."""
        return self._errors
    
    def _add_error(self, message: str, field: str = 'unknown'):
        """Add validation error."""
        self._valid = False
        self._errors.append({
            'field': field,
            'message': message,
            'code': 'validation_error'
        })
    
    def clear(self):
        """Clear validation errors."""
        self._errors = []
        self._valid = True
    
    @staticmethod
    def get_validator():
        """Get a new validator instance."""
        return Validator()


# ============================================================================
# Factory Function
# ============================================================================

def get_validator() -> Validator:
    """
    Get a validator instance.
    
    Returns:
        Validator: Validator instance
    """
    return Validator()


# ============================================================================
# Module Exports
# ============================================================================

__all__ = [
    # Constants
    'EMAIL_REGEX',
    'PHONE_REGEX',
    'US_PHONE_REGEX',
    'LICENSE_PLATE_REGEX',
    'VIN_REGEX',
    'URL_REGEX',
    'UUID_REGEX',
    'IPV4_REGEX',
    'IPV6_REGEX',
    'MAC_REGEX',
    'US_ZIP_REGEX',
    'UK_POSTCODE_REGEX',
    'CA_POSTAL_REGEX',
    'CARD_PATTERNS',
    'US_STATE_CODES',
    'COUNTRY_CODES',
    'CURRENCY_CODES',
    'LANGUAGE_CODES',
    
    # Enums
    'PasswordStrength',
    
    # Exceptions
    'ValidationError',
    
    # Validation Functions
    'validate_email',
    'validate_phone',
    'validate_license_plate',
    'validate_vin',
    'validate_url',
    'validate_uuid',
    'validate_ip_address',
    'validate_mac_address',
    'validate_postal_code',
    'validate_state_code',
    'validate_country_code',
    'validate_currency_code',
    'validate_language_code',
    'validate_credit_card',
    'validate_expiry_date',
    'validate_cvv',
    'validate_password_strength',
    'validate_date',
    'validate_time',
    'validate_datetime',
    'validate_with_regex',
    'validate_length',
    'validate_range',
    'validate_enum',
    'validate_required',
    
    # Convenience Functions
    'is_valid_email',
    'is_valid_phone',
    'is_valid_license_plate',
    'is_valid_vin',
    'is_valid_url',
    'is_valid_uuid',
    'is_valid_password',
    'is_valid_ip',
    'is_valid_postal_code',
    
    # Validator Class
    'Validator',
    'get_validator',
]