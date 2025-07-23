# User Data Directory Structure

This directory contains identity-specific resources for the UNNC Identity Verification Portal.

## Directory Structure

Each identity should have its own subdirectory with the following required files:

```
identity-name/
├── favicon.ico          # Website icon for this identity
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

#### Required locale files:

- `zh-CN.yml` - Chinese (Simplified)
- `en-US.yml` - English (US)
- `en-UK.yml` - English (UK)

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
