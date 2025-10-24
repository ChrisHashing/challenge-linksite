/**
 * Universal Link-in-Bio Renderer
 * 
 * This is a REFERENCE IMPLEMENTATION for the TW3 challenge.
 * Community members should build their own renderer that works universally
 * with any JSON content structure.
 * 
 * Features this reference implementation includes:
 * - Dynamic theme loading
 * - Universal JSON parsing
 * - Error handling
 * - Accessibility features
 * - Performance optimizations
 */

class UniversalLinkRenderer {
    constructor() {
        this.config = null;
        this.theme = null;
        this.init();
    }

    async init() {
        try {
            await this.loadConfiguration();
            await this.loadTheme();
            this.updatePageTitle();
            this.renderContent();
            this.hideLoading();
        } catch (error) {
            console.error('Renderer initialization failed:', error);
            this.showError(error.message);
        }
    }

    async loadConfiguration() {
        try {
            const response = await fetch('./content/data.json');
            if (!response.ok) {
                throw new Error(`Failed to load configuration: ${response.status}`);
            }
            this.config = await response.json();
            
            // Basic validation
            if (!this.config) {
                throw new Error('Invalid or empty configuration');
            }
        } catch (error) {
            throw new Error(`Configuration error: ${error.message}`);
        }
    }

    async loadTheme() {
        const themeName = this.config.theme || 'default';
        const themePath = `./styles/${themeName}.css`;
        
        return new Promise((resolve) => {
            // Check if theme already loaded
            const existingTheme = document.querySelector(`link[href="${themePath}"]`);
            if (existingTheme) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = themePath;
            link.onload = () => {
                this.theme = themeName;
                resolve();
            };
            link.onerror = () => {
                console.warn(`Theme ${themeName} not found, using default styling`);
                this.theme = 'default';
                resolve();
            };
            document.head.appendChild(link);
        });
    }

    updatePageTitle() {
        if (this.config.profile?.name) {
            document.title = `${this.config.profile.name} - Link-in-Bio`;
        }
    }

    renderContent() {
        const app = document.getElementById('app');
        if (!app) return;

        // Clear existing content
        app.innerHTML = '';

        // Create main container
        const container = document.createElement('div');
        container.className = 'container';

        // Render profile section
        if (this.config.profile) {
            container.appendChild(this.renderProfile());
        }

        // Render links section
        if (this.config.links && Array.isArray(this.config.links)) {
            container.appendChild(this.renderLinks());
        }

        // Render social section
        if (this.config.social) {
            container.appendChild(this.renderSocial());
        }

        // Apply customizations
        this.applyCustomizations();

        app.appendChild(container);
    }

    renderProfile() {
        const profile = this.config.profile;
        const profileSection = document.createElement('div');
        profileSection.className = 'profile';

        // Avatar
        if (profile.avatar) {
            const avatar = document.createElement('img');
            avatar.className = 'avatar';
            avatar.src = profile.avatar;
            avatar.alt = profile.name ? `${profile.name} avatar` : 'Profile avatar';
            profileSection.appendChild(avatar);
        }

        // Name
        if (profile.name) {
            const name = document.createElement('h1');
            name.className = 'name';
            name.textContent = profile.name;
            profileSection.appendChild(name);
        }

        // Title
        if (profile.title) {
            const title = document.createElement('h2');
            title.className = 'title';
            title.textContent = profile.title;
            profileSection.appendChild(title);
        }

        // Bio
        if (profile.bio) {
            const bio = document.createElement('p');
            bio.className = 'bio';
            bio.textContent = profile.bio;
            profileSection.appendChild(bio);
        }

        return profileSection;
    }

    renderLinks() {
        const linksSection = document.createElement('div');
        linksSection.className = 'links';

        this.config.links.forEach((link, index) => {
            const linkElement = this.createLinkElement(link, index);
            linksSection.appendChild(linkElement);
        });

        return linksSection;
    }

    createLinkElement(link, index) {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        linkItem.style.animationDelay = `${index * 0.1}s`;

        const linkContent = document.createElement('a');
        linkContent.className = 'link-content';
        linkContent.href = link.url;
        linkContent.target = '_blank';
        linkContent.rel = 'noopener noreferrer';
        linkContent.setAttribute('aria-label', `Visit ${link.title}`);

        // Icon
        if (link.icon) {
            const icon = document.createElement('div');
            icon.className = 'link-icon';
            icon.textContent = link.icon;
            linkContent.appendChild(icon);
        }

        // Text content
        const textContent = document.createElement('div');
        textContent.className = 'link-text';

        const title = document.createElement('div');
        title.className = 'link-title';
        title.textContent = link.title;
        textContent.appendChild(title);

        if (link.description) {
            const description = document.createElement('div');
            description.className = 'link-description';
            description.textContent = link.description;
            textContent.appendChild(description);
        }

        linkContent.appendChild(textContent);
        linkItem.appendChild(linkContent);

        return linkItem;
    }

    renderSocial() {
        const socialSection = document.createElement('div');
        socialSection.className = 'social';

        const socialPlatforms = {
            twitter: { icon: '🐦', url: 'https://twitter.com/' },
            github: { icon: '🐙', url: 'https://github.com/' },
            linkedin: { icon: '💼', url: 'https://linkedin.com/in/' },
            youtube: { icon: '📺', url: 'https://youtube.com/@' },
            discord: { icon: '💬', url: 'https://discord.gg/' },
            instagram: { icon: '📷', url: 'https://instagram.com/' },
            tiktok: { icon: '🎵', url: 'https://tiktok.com/@' },
            twitch: { icon: '🎮', url: 'https://twitch.tv/' }
        };

        Object.entries(this.config.social).forEach(([platform, handle]) => {
            if (handle && socialPlatforms[platform]) {
                const socialLink = this.createSocialLink(platform, handle, socialPlatforms[platform]);
                socialSection.appendChild(socialLink);
            }
        });

        return socialSection;
    }

    createSocialLink(platform, handle, platformData) {
        const link = document.createElement('a');
        link.className = 'social-link';
        link.href = `${platformData.url}${handle}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `Visit ${platform} profile`);
        link.textContent = platformData.icon;

        return link;
    }

    applyCustomizations() {
        if (!this.config.customization) return;

        const root = document.documentElement;
        const customization = this.config.customization;

        // Apply CSS custom properties
        Object.entries(customization).forEach(([key, value]) => {
            if (value) {
                const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                root.style.setProperty(cssVar, value);
            }
        });

        // Apply background to body if specified
        if (customization.background) {
            document.body.style.background = customization.background;
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        
        if (loading) loading.classList.add('hidden');
        if (app) app.classList.remove('hidden');
    }

    showError(message) {
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        const error = document.getElementById('error');
        const errorMessage = document.getElementById('error-message');
        
        if (loading) loading.classList.add('hidden');
        if (app) app.classList.add('hidden');
        if (error) error.classList.remove('hidden');
        if (errorMessage) errorMessage.textContent = message;
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Renderer loaded in ${loadTime.toFixed(2)}ms`);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new UniversalLinkRenderer();
    new PerformanceMonitor();
});

// Export for external use
window.UniversalLinkRenderer = UniversalLinkRenderer;
