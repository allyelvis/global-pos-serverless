interface VersionInfo {
  version: string
  build: string
  releaseDate: string
}

export function getVersionInfo(): VersionInfo {
  return {
    version: "1.0.0",
    build: process.env.BUILD_NUMBER || "1",
    releaseDate: "2025-03-21",
  }
}

export function isNewerVersion(databaseVersion: string): boolean {
  const currentVersion = getVersionInfo().version

  // Split versions into components
  const dbComponents = databaseVersion.split(".").map(Number)
  const currentComponents = currentVersion.split(".").map(Number)

  // Compare major, minor, patch
  for (let i = 0; i < 3; i++) {
    if (currentComponents[i] > dbComponents[i]) {
      return true
    }
    if (currentComponents[i] < dbComponents[i]) {
      return false
    }
  }

  return false
}

