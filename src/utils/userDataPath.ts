import path from "path";

/**
 * Get the user data root path, with fallback handling for different environments
 */
export function getUserDataRoot(): string | null {
  const userDataRoot = process.env.UNNC_VERIFY_USER_DATA_ROOT;

  if (!userDataRoot) {
    // In development environment, fallback to local user-data directory
    if (process.env.NODE_ENV === "development") {
      return path.resolve(process.cwd(), "user-data");
    }
    return null;
  }

  // In Docker container, ensure the path is absolute
  // If it's already absolute, use as-is
  // If it's relative, resolve from the current working directory
  if (path.isAbsolute(userDataRoot)) {
    return userDataRoot;
  }

  // For relative paths, resolve from process.cwd()
  return path.resolve(process.cwd(), userDataRoot);
}

/**
 * Get the identity path for a given identity name
 */
export function getIdentityPath(identity: string): string | null {
  const userDataRoot = getUserDataRoot();
  if (!userDataRoot) {
    return null;
  }

  return path.join(userDataRoot, identity.toLowerCase());
}
