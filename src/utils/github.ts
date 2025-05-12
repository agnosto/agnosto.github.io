export interface Asset {
    name: string;
    browser_download_url: string;
    size: number;
}

export interface Release {
    tag_name: string;
    published_at: string;
    body: string;
    assets: Asset[];
}

export interface ProcessedAsset {
    arch: string;
    file: string;
    url: string;
    size: number;
}

export interface Platforms {
    windows: ProcessedAsset[];
    macos: ProcessedAsset[];
    linux: ProcessedAsset[];
}

/**
 * Fetch releases from a GitHub repository
 */
export async function fetchReleases(repo: string): Promise<Release[]> {
    try {
        const headers: HeadersInit = {};

        // Add GitHub token if available to increase rate limit
        if (import.meta.env.PUBLIC_GITHUB_TOKEN) {
            headers.Authorization = `token ${import.meta.env.PUBLIC_GITHUB_TOKEN}`;
        }

        const response = await fetch(`https://api.github.com/repos/${repo}/releases`, { headers });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const releases = await response.json();
        return releases;
    } catch (error) {
        console.error("Error fetching releases:", error);
        return [];
    }
}

/**
 * Parse changelog from release body
 */
export function parseChangelog(body: string): string[] {
    if (!body) return [];

    // Try to extract changelog items (lines starting with - or *)
    const changelogRegex = /[-*]\s+(.+)/g;
    const matches = [...body.matchAll(changelogRegex)];

    if (matches.length > 0) {
        return matches.map(match => match[1].trim());
    }

    // Fallback: split by newlines and filter empty lines
    return body
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));
}

/**
 * Categorize assets by platform and architecture
 */
export function categorizeAssets(assets: Asset[]): Platforms {
    const platforms: Platforms = {
        windows: [],
        macos: [],
        linux: []
    };

    assets.forEach(asset => {
        const name = asset.name.toLowerCase();

        // Skip non-archive files
        if (!name.endsWith('.zip') && !name.endsWith('.tar.gz') && !name.endsWith('.exe')) {
            return;
        }

        let platform: keyof Platforms | null = null;
        let arch = '';

        // Determine platform and architecture
        if (name.includes('windows') || name.endsWith('.exe')) {
            platform = 'windows';

            if (name.includes('386') || name.includes('x86')) {
                arch = 'x86';
            } else if (name.includes('amd64') || name.includes('x64')) {
                arch = 'x64';
            } else if (name.includes('arm64')) {
                arch = 'ARM64';
            }
        } else if (name.includes('darwin') || name.includes('macos')) {
            platform = 'macos';

            if (name.includes('amd64') || name.includes('x64')) {
                arch = 'Intel';
            } else if (name.includes('arm64')) {
                arch = 'Apple Silicon';
            }
        } else if (name.includes('linux')) {
            platform = 'linux';

            if (name.includes('386') || name.includes('x86')) {
                arch = 'x86';
            } else if (name.includes('amd64') || name.includes('x64')) {
                arch = 'x64';
            } else if (name.includes('arm64')) {
                arch = 'ARM64';
            }
        }

        if (platform && arch) {
            platforms[platform].push({
                arch,
                file: asset.name,
                url: asset.browser_download_url,
                size: asset.size
            });
        }
    });

    return platforms;
}

/**
 * Format date to a readable string
 */
export function formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format file size to a readable string
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

