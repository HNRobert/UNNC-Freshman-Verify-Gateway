# User Data Directory Structure

This directory contains identity-specific resources for the UNNC Identity Verification Portal.

## Directory Structure

Each identity should have its own subdirectory with the following required files:

```text
identity-name/
├── favicon.ico         # Website icon for this identity
├── qrcode.jpg          # QR code image (can be .jpg, .png, .gif, etc.)
└── locales/            # Language files directory
    ├── zh-CN.yml       # Chinese (Simplified) translations
    ├── en-US.yml       # English (US) translations
    └── en-UK.yml       # English (UK) translations
```

## Required Files

### 1. favicon.ico

- Website icon that will be displayed in the browser tab
- Standard ICO format recommended
- 16x16, 32x32, or 48x48 pixels

### 2. qrcode.jpg (or similar)

- QR code image for the group/organization
- Supported formats: .jpg, .jpeg, .png, .gif, .webp
- Recommended size: 300x300 pixels or larger
- Must contain "qrcode" in the filename (case-insensitive)

### 3. locales/

Directory containing language-specific YAML files with translations.

#### Supported Languages

The system dynamically scans for available language files. You can create any locale files following the `language-COUNTRY` format:

- `zh-CN.yml` - Chinese (Simplified)
- `zh-TW.yml` - Chinese (Traditional)
- `en-US.yml` - English (US)
- `en-UK.yml` - English (UK)
- `en-GB.yml` - English (GB)
- `ja-JP.yml` - Japanese
- `ko-KR.yml` - Korean
- `fr-FR.yml` - French
- `de-DE.yml` - German
- `es-ES.yml` - Spanish
- `pt-PT.yml` - Portuguese
- `ru-RU.yml` - Russian
- `ar-SA.yml` - Arabic
- `hi-IN.yml` - Hindi
- `th-TH.yml` - Thai
- `vi-VN.yml` - Vietnamese
- `ms-MY.yml` - Malay
- `id-ID.yml` - Indonesian
- Or any other locale code you need

**Note:** The system will automatically detect and load any `.yml` or `.yaml` files in the locales directory. You only need to include the languages you want to support for your identity/group.

## Locale File Structure

Each locale file should contain the following sections:

```yaml
# Metadata
metadata:
  title: "Group Name QR Code Verification"
  description: "Description of the verification system"

# Common texts
common:
  switchLanguage: "Switch Language"
  # ... other common translations

# Verification page texts
verify:
  groupName: "Your Group Name"
  title: "QR Code Access Verification"
  description: "Verification description"
  warningText: "Warning message"
  unableToVerifyMessage: "Help message for users who cannot verify"
  # ... other verify translations

# Show page texts
show:
  successTitle: "Verification Successful - {groupName}"
  instructions: "Instructions for using the QR code"
  # ... other show translations

# Validation texts
validation:
  idRequired: "Please enter ID number"
  # ... other validation messages
```

## Environment Configuration

Set the `UNNC_VERIFY_USER_DATA_ROOT` environment variable to point to the parent directory containing all identity subdirectories:

```bash
export UNNC_VERIFY_USER_DATA_ROOT=/path/to/this/directory
```

## Example

See the `cpu/` directory for a complete example of an identity configuration.

## Docker Compose

When using Docker Compose, the user data directory will be mounted read-only to `/app/user-data` inside the container.

Make sure to set the environment variable before running:

```bash
export UNNC_VERIFY_USER_DATA_ROOT=/path/to/your/user-data
docker-compose up -d
```
