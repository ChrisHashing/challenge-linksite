/**
 * Link-in-Bio Builder - Web Editor
 * 
 * This script provides the functionality for the web-based editor
 * that allows users to create and customize their link-in-bio pages.
 */

class LinkBioEditor {
    constructor() {
        this.config = this.getDefaultConfig();
        this.themes = [
            { name: 'minimal', display: 'Minimal', color: '#ffffff' },
            { name: 'creator', display: 'Creator', color: '#ff6b6b' },
            { name: 'technicallyweb3', display: 'Web3', color: '#6366f1' },
            { name: 'dark', display: 'Dark', color: '#0a0a0a' },
            { name: 'nature', display: 'Nature', color: '#228b22' },
            { name: 'vintage', display: 'Vintage', color: '#cd853f' },
            { name: 'glass', display: 'Glass', color: '#667eea' },
            { name: 'lensa', display: 'Lensa', color: '#6A0DAD' },
            { name: 'glassy', display: 'Glassy', color: '#1e1e1e' },
            { name: 'minimalist', display: 'Minimalist', color: '#f5f5f5' }
        ];
        this.currentTheme = 'minimal';
        this.previewTimeout = null;
        this.gradientColors = ['#667eea', '#764ba2'];
        this.gradientDirection = 'to right';
        this.backgroundType = 'solid';
        this.customizationEnabled = false;
        this.init();
    }

    init() {
        this.setupThemeSelector();
        this.loadDefaultTemplate();
        this.setupEventListeners();
        this.updatePreview();
    }

    getDefaultConfig() {
        return {
            theme: 'minimal',
            iconSet: 'default',
            profile: {
                name: '',
                title: '',
                bio: '',
                avatar: ''
            },
            links: [],
            social: {},
            customization: {
                background: '',
                accentColor: '',
                textColor: '',
                linkColor: ''
            }
        };
    }

    setupThemeSelector() {
        const themeSelector = document.getElementById('theme-selector');
        themeSelector.innerHTML = '';

        this.themes.forEach(theme => {
            const themeOption = document.createElement('div');
            themeOption.className = 'theme-option';
            themeOption.dataset.theme = theme.name;
            
            themeOption.innerHTML = `
                <div class="theme-preview" style="background: ${theme.color}"></div>
                <div class="theme-name">${theme.display}</div>
            `;
            
            themeOption.addEventListener('click', () => {
                this.selectTheme(theme.name);
            });
            
            themeSelector.appendChild(themeOption);
        });
    }

    selectTheme(themeName) {
        this.currentTheme = themeName;
        this.config.theme = themeName;
        
        // Update UI
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('selected');
        
        // If customization is disabled, clear custom colors and use theme defaults
        if (!this.customizationEnabled) {
            this.clearCustomColors();
        }
        
        this.updatePreview();
    }

    setupEventListeners() {
        // Profile inputs
        document.getElementById('profile-name').addEventListener('input', (e) => {
            this.config.profile.name = e.target.value;
            this.updatePreview();
        });
        
        document.getElementById('profile-title').addEventListener('input', (e) => {
            this.config.profile.title = e.target.value;
            this.updatePreview();
        });
        
        document.getElementById('profile-bio').addEventListener('input', (e) => {
            this.config.profile.bio = e.target.value;
            this.updatePreview();
        });
        
        document.getElementById('profile-avatar').addEventListener('input', (e) => {
            this.config.profile.avatar = e.target.value;
            this.updatePreview();
        });

        // Social inputs
        const socialInputs = ['twitter', 'github', 'linkedin', 'instagram', 'youtube', 'discord'];
        socialInputs.forEach(platform => {
            document.getElementById(`social-${platform}`).addEventListener('input', (e) => {
                if (e.target.value.trim()) {
                    this.config.social[platform] = e.target.value.trim();
                } else {
                    delete this.config.social[platform];
                }
                this.updatePreview();
            });
        });

        // Background type selection
        document.querySelectorAll('input[name="background-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.backgroundType = e.target.value;
                this.toggleBackgroundSections();
                this.updateBackgroundPreview();
                this.updatePreview();
            });
        });

        // Solid background color
        document.getElementById('custom-background-solid').addEventListener('input', (e) => {
            const hexInput = document.getElementById('custom-background-solid-hex');
            hexInput.value = e.target.value;
            this.updateBackgroundPreview();
            if (this.customizationEnabled) {
                this.updatePreview();
            }
        });

        document.getElementById('custom-background-solid-hex').addEventListener('input', (e) => {
            const colorInput = document.getElementById('custom-background-solid');
            if (this.isValidHex(e.target.value)) {
                colorInput.value = e.target.value;
                this.updateBackgroundPreview();
                if (this.customizationEnabled) {
                    this.updatePreview();
                }
            }
        });

        // Container background color
        document.getElementById('custom-container-background').addEventListener('input', (e) => {
            const hexInput = document.getElementById('custom-container-background-hex');
            hexInput.value = e.target.value;
            if (this.customizationEnabled) {
                this.updatePreview();
            }
        });

        document.getElementById('custom-container-background-hex').addEventListener('input', (e) => {
            const colorInput = document.getElementById('custom-container-background');
            if (this.isValidHex(e.target.value)) {
                colorInput.value = e.target.value;
                if (this.customizationEnabled) {
                    this.updatePreview();
                }
            }
        });

        // Gradient direction
        document.getElementById('gradient-direction').addEventListener('change', (e) => {
            this.gradientDirection = e.target.value;
            this.updateGradientPreview();
            this.updateBackgroundPreview();
            if (this.customizationEnabled) {
                this.updatePreview();
            }
        });

        // Gradient colors
        this.setupGradientColorListeners();

        // Customization toggle
        document.getElementById('enable-customization').addEventListener('change', (e) => {
            this.customizationEnabled = e.target.checked;
            this.toggleCustomizationSection();
            this.updatePreview();
        });

        // Icon Set selector
        const iconSetSelect = document.getElementById('icon-set-select');
        if (iconSetSelect) {
            iconSetSelect.addEventListener('change', (e) => {
                this.config.iconSet = e.target.value;
                this.updatePreview();
            });
        }

        // Other color inputs with hex sync
        this.setupColorInputSync('custom-accent', 'custom-accent-hex');
        this.setupColorInputSync('custom-text', 'custom-text-hex');
        this.setupColorInputSync('custom-link', 'custom-link-hex');
    }

    loadDefaultTemplate() {
        // Load the default template
        fetch('./content/default-template.json')
            .then(response => response.json())
            .then(data => {
                this.config = data;
                this.populateForm();
                this.updatePreview();
            })
            .catch(error => {
                console.error('Error loading template:', error);
                this.showMessage('Error loading default template', 'error');
            });
    }

    populateForm() {
        // Profile
        document.getElementById('profile-name').value = this.config.profile.name || '';
        document.getElementById('profile-title').value = this.config.profile.title || '';
        document.getElementById('profile-bio').value = this.config.profile.bio || '';
        document.getElementById('profile-avatar').value = this.config.profile.avatar || '';

        // Theme
        this.selectTheme(this.config.theme || 'minimal');
        
        // Icon Set
        const iconSetSelect = document.getElementById('icon-set-select');
        if (iconSetSelect) {
            iconSetSelect.value = this.config.iconSet || 'default';
        }

        // Social
        Object.entries(this.config.social || {}).forEach(([platform, handle]) => {
            const input = document.getElementById(`social-${platform}`);
            if (input) input.value = handle;
        });

        // Customization
        // Check if customizations exist and are enabled
        // enabled flag defaults to true for backward compatibility
        const hasCustomizations = this.config.customization && Object.keys(this.config.customization).length > 0;
        const isEnabled = hasCustomizations && (this.config.customization.enabled !== false);
        this.customizationEnabled = isEnabled;
        document.getElementById('enable-customization').checked = this.customizationEnabled;
        
        if (hasCustomizations) {
            this.applyBackgroundFromConfig();
            document.getElementById('custom-accent').value = this.config.customization?.accentColor || '#6366f1';
            document.getElementById('custom-accent-hex').value = this.config.customization?.accentColor || '#6366f1';
            document.getElementById('custom-text').value = this.config.customization?.textColor || '#ffffff';
            document.getElementById('custom-text-hex').value = this.config.customization?.textColor || '#ffffff';
            document.getElementById('custom-link').value = this.config.customization?.linkColor || '#fbbf24';
            document.getElementById('custom-link-hex').value = this.config.customization?.linkColor || '#fbbf24';
        } else {
            // Use theme defaults
            this.clearCustomColors();
        }
        
        this.toggleCustomizationSection();

        // Links
        this.renderLinks();
    }

    renderLinks() {
        const container = document.getElementById('links-container');
        container.innerHTML = '';

        this.config.links.forEach((link, index) => {
            const linkElement = this.createLinkElement(link, index);
            container.appendChild(linkElement);
        });
    }

    createLinkElement(link, index) {
        const linkDiv = document.createElement('div');
        linkDiv.className = 'link-item';
        linkDiv.innerHTML = `
            <div class="link-item-header">
                <div class="link-item-title">Link ${index + 1}</div>
                <div class="link-item-actions">
                    <button class="btn btn-danger btn-small" onclick="editor.removeLink(${index})">Remove</button>
                </div>
            </div>
            <div class="form-row">
                <div>
                    <label class="form-label">Title</label>
                    <input type="text" class="form-input" value="${link.title || ''}" 
                           onchange="editor.updateLink(${index}, 'title', this.value)">
                </div>
                <div>
                    <label class="form-label">Icon</label>
                    <input type="text" class="form-input" value="${link.icon || ''}" 
                           onchange="editor.updateLink(${index}, 'icon', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">URL</label>
                <input type="url" class="form-input" value="${link.url || ''}" 
                       onchange="editor.updateLink(${index}, 'url', this.value)">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <input type="text" class="form-input" value="${link.description || ''}" 
                       onchange="editor.updateLink(${index}, 'description', this.value)">
            </div>
        `;
        return linkDiv;
    }

    addLink() {
        this.config.links.push({
            title: 'New Link',
            url: '',
            icon: '🔗',
            description: ''
        });
        this.renderLinks();
        this.updatePreview();
    }

    removeLink(index) {
        this.config.links.splice(index, 1);
        this.renderLinks();
        this.updatePreview();
    }

    updateLink(index, field, value) {
        if (this.config.links[index]) {
            this.config.links[index][field] = value;
            this.updatePreview();
        }
    }

    updatePreview() {
        // Debounce preview updates to improve performance
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }
        
        this.previewTimeout = setTimeout(() => {
            const previewContainer = document.getElementById('preview-iframe');
            previewContainer.innerHTML = this.generatePreviewContent();
        }, 150);
    }

    generatePreviewContent() {
        const config = this.config;
        const theme = config.theme || 'minimal';
        
        // Apply customizations or theme defaults
        const customizations = config.customization || {};
        let background, accentColor, textColor, linkColor;
        
        if (this.customizationEnabled) {
            // Use custom colors
            if (this.backgroundType === 'solid') {
                background = document.getElementById('custom-background-solid')?.value || customizations.background || this.getThemeDefaultBackground(theme);
            } else {
                background = this.generateGradientString();
            }
            accentColor = customizations.accentColor || this.getThemeDefaultAccent(theme);
            textColor = customizations.textColor || this.getThemeDefaultText(theme);
            linkColor = customizations.linkColor || this.getThemeDefaultLink(theme);
        } else {
            // Use theme defaults
            background = this.getThemeDefaultBackground(theme);
            accentColor = this.getThemeDefaultAccent(theme);
            textColor = this.getThemeDefaultText(theme);
            linkColor = this.getThemeDefaultLink(theme);
        }
        
        // Get container background
        const isLensaTheme = theme === 'lensa';
        const isGlassyTheme = theme === 'glassy';
        const isMinimalistTheme = theme === 'minimalist';
        let containerBackground, containerStyle;
        
        if (isLensaTheme || isGlassyTheme) {
            containerBackground = 'transparent';
            containerStyle = 'background: transparent; box-shadow: none;';
        } else if (isMinimalistTheme) {
            containerBackground = '#e8e8e8';
            containerStyle = `background: ${containerBackground}; border-radius: 0;`;
        } else {
            containerBackground = this.customizationEnabled ? 
                (document.getElementById('custom-container-background')?.value || customizations.containerBackground || '#ffffff') : 
                '#ffffff';
            containerStyle = `background: ${containerBackground}; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);`;
        }
        
        return `
            <div class="preview-content" style="
                background: ${background};
                color: ${textColor};
                min-height: 600px;
                padding: 1.25rem;
                font-family: 'Inter', sans-serif;
                position: relative;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    ${containerStyle}
                    padding: 2rem;
                    min-height: calc(100vh - 4rem);
                ">
                    <!-- Profile Section -->
                    <div style="text-align: center; margin-bottom: 2rem;">
                        ${config.profile?.avatar ? `
                            <img src="${config.profile.avatar}" alt="Avatar" style="
                                width: 100px;
                                height: 100px;
                                border-radius: 50%;
                                margin-bottom: 1rem;
                                border: 2px solid ${accentColor};
                                object-fit: cover;
                            ">
                        ` : ''}
                        ${config.profile?.name ? `
                            <h1 style="
                                font-size: 1.75rem;
                                font-weight: 700;
                                margin-bottom: 0.5rem;
                                color: ${textColor};
                            ">${config.profile.name}</h1>
                        ` : ''}
                        ${config.profile?.title ? `
                            <h2 style="
                                font-size: 1rem;
                                color: ${textColor};
                                opacity: 0.8;
                                margin-bottom: 1rem;
                                font-weight: 500;
                            ">${config.profile.title}</h2>
                        ` : ''}
                        
                        <!-- Social Section (after title, before bio) -->
                        ${Object.keys(config.social || {}).length > 0 ? `
                            <div style="
                                display: flex;
                                justify-content: center;
                                gap: 1rem;
                                margin: 1rem 0;
                            ">
                                ${Object.entries(config.social).map(([platform, handle]) => {
                                    if (!handle) return '';
                                    const platformData = this.getSocialPlatformData(platform);
                                    const iconSet = config.iconSet || 'default';
                                    const iconPath = platformData.iconFile ? `./icons/${iconSet}/${platformData.iconFile}` : null;
                                    return `
                                        <a href="${platformData.url}${handle}" style="
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            width: 40px;
                                            height: 40px;
                                            background: rgba(255, 255, 255, 0.1);
                                            border: 1px solid rgba(255, 255, 255, 0.2);
                                            border-radius: 50%;
                                            color: ${textColor};
                                            text-decoration: none;
                                            transition: all 0.3s ease;
                                            font-size: 1rem;
                                        " onmouseover="this.style.transform='translateY(-2px) scale(1.1)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)'" 
                                           onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='none'">
                                            ${iconPath ? `<img src="${iconPath}" alt="${platform}" style="width: 20px; height: 20px; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.textContent='${platformData.icon}'">` : platformData.icon}
                                        </a>
                                    `;
                                }).join('')}
                            </div>
                        ` : ''}
                        
                        ${config.profile?.bio ? `
                            <p style="
                                font-size: 0.9rem;
                                color: ${textColor};
                                opacity: 0.8;
                                line-height: 1.6;
                                max-width: 320px;
                                margin: 0 auto;
                            ">${config.profile.bio}</p>
                        ` : ''}
                    </div>
                    
                    <!-- Links Section -->
                    ${config.links && config.links.length > 0 ? `
                        <div style="margin-bottom: 2rem;">
                            ${config.links.map(link => `
                                <div style="
                                    background: rgba(255, 255, 255, 0.1);
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    border-radius: 12px;
                                    margin-bottom: 1rem;
                                    transition: all 0.3s ease;
                                    cursor: pointer;
                                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)'" 
                                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                    <a href="${link.url || '#'}" style="
                                        padding: 1.25rem;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        text-decoration: none;
                                        color: inherit;
                                    ">
                                        <div style="
                                            text-align: center;
                                            width: 100%;
                                        ">
                                            <div style="
                                                font-size: 1rem;
                                                font-weight: 600;
                                                margin-bottom: 0.25rem;
                                                color: ${textColor};
                                            ">${link.title || 'Link Title'}</div>
                                            ${link.description ? `
                                                <div style="
                                                    font-size: 0.85rem;
                                                    color: ${textColor};
                                                    opacity: 0.8;
                                                    line-height: 1.4;
                                                ">${link.description}</div>
                                            ` : ''}
                                        </div>
                                    </a>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    getThemeDefaultBackground(theme) {
        const backgrounds = {
            minimal: '#ffffff',
            creator: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
            technicallyweb3: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            dark: '#1a1a1a',
            nature: 'linear-gradient(135deg, #2d5016 0%, #4a7c59 50%, #8fbc8f 100%)',
            vintage: 'linear-gradient(135deg, #8b4513 0%, #cd853f 50%, #daa520 100%)',
            glass: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            lensa: '#6A0DAD',
            glassy: '#0a0a0a',
            minimalist: '#f5f5f5'
        };
        return backgrounds[theme] || '#ffffff';
    }
    
    getThemeDefaultAccent(theme) {
        const accents = {
            minimal: '#3b82f6',
            creator: '#ff6b6b',
            technicallyweb3: '#6366f1',
            dark: '#000000',
            nature: '#228b22',
            vintage: '#cd853f',
            glass: '#6366f1',
            lensa: '#E066FF',
            glassy: 'rgba(255, 255, 255, 0.1)',
            minimalist: '#e8e8e8'
        };
        return accents[theme] || '#3b82f6';
    }
    
    getThemeDefaultText(theme) {
        const texts = {
            minimal: '#1e293b',
            creator: '#ffffff',
            technicallyweb3: '#ffffff',
            dark: '#ffffff',
            nature: '#f5f5dc',
            vintage: '#fff8dc',
            glass: '#ffffff',
            lensa: '#ffffff',
            glassy: '#ffffff',
            minimalist: '#2a2a2a'
        };
        return texts[theme] || '#1e293b';
    }
    
    getThemeDefaultLink(theme) {
        const links = {
            minimal: '#1e40af',
            creator: '#4ecdc4',
            technicallyweb3: '#fbbf24',
            dark: '#000000',
            nature: '#90ee90',
            vintage: '#ffd700',
            glass: '#e0e7ff',
            lensa: '#E066FF',
            glassy: 'rgba(255, 255, 255, 0.1)',
            minimalist: '#e8e8e8'
        };
        return links[theme] || '#1e40af';
    }
    
    getSocialPlatformData(platform) {
        const platforms = {
            twitter: { icon: '🐦', url: 'https://twitter.com/', iconFile: 'twitter.svg' },
            github: { icon: '🐙', url: 'https://github.com/', iconFile: 'github.svg' },
            linkedin: { icon: '💼', url: 'https://linkedin.com/in/', iconFile: 'linkedin.svg' },
            youtube: { icon: '📺', url: 'https://youtube.com/@', iconFile: 'youtube.svg' },
            discord: { icon: '💬', url: 'https://discord.gg/', iconFile: 'discord.svg' },
            instagram: { icon: '📷', url: 'https://instagram.com/', iconFile: 'instagram.svg' },
            tiktok: { icon: '🎵', url: 'https://tiktok.com/@', iconFile: 'tik-tok.svg' },
            twitch: { icon: '🎮', url: 'https://twitch.tv/', iconFile: 'twitch.svg' },
            reddit: { icon: '🔴', url: 'https://reddit.com/user/', iconFile: 'reddit.svg' },
            snapchat: { icon: '👻', url: 'https://snapchat.com/add/', iconFile: 'snapchat.svg' },
            telegram: { icon: '✈️', url: 'https://t.me/', iconFile: 'telegram.svg' },
            whatsapp: { icon: '💬', url: 'https://wa.me/', iconFile: 'whatsapp.svg' }
        };
        return platforms[platform] || { icon: '🔗', url: '#' };
    }

    setupGradientColorListeners() {
        // Set up listeners for existing gradient colors
        for (let i = 1; i <= this.gradientColors.length; i++) {
            this.setupGradientColorListener(i);
        }
    }

    setupGradientColorListener(index) {
        const colorInput = document.getElementById(`gradient-color-${index}`);
        const hexInput = document.getElementById(`gradient-color-${index}-hex`);
        
        if (colorInput && hexInput) {
            colorInput.addEventListener('input', (e) => {
                hexInput.value = e.target.value;
                this.gradientColors[index - 1] = e.target.value;
                this.updateGradientPreview();
                this.updateBackgroundPreview();
                if (this.customizationEnabled) {
                    this.updatePreview();
                }
            });

            hexInput.addEventListener('input', (e) => {
                if (this.isValidHex(e.target.value)) {
                    colorInput.value = e.target.value;
                    this.gradientColors[index - 1] = e.target.value;
                    this.updateGradientPreview();
                    this.updateBackgroundPreview();
                    if (this.customizationEnabled) {
                        this.updatePreview();
                    }
                }
            });
        }
    }

    setupColorInputSync(colorInputId, hexInputId) {
        const colorInput = document.getElementById(colorInputId);
        const hexInput = document.getElementById(hexInputId);
        
        if (colorInput && hexInput) {
            colorInput.addEventListener('input', (e) => {
                hexInput.value = e.target.value;
                if (this.customizationEnabled) {
                    this.config.customization[colorInputId.replace('custom-', '')] = e.target.value;
                    this.updatePreview();
                }
            });

            hexInput.addEventListener('input', (e) => {
                if (this.isValidHex(e.target.value)) {
                    colorInput.value = e.target.value;
                    if (this.customizationEnabled) {
                        this.config.customization[colorInputId.replace('custom-', '')] = e.target.value;
                        this.updatePreview();
                    }
                }
            });
        }
    }

    toggleBackgroundSections() {
        const solidSection = document.getElementById('solid-background-section');
        const gradientSection = document.getElementById('gradient-background-section');
        
        if (this.backgroundType === 'solid') {
            solidSection.style.display = 'block';
            gradientSection.style.display = 'none';
        } else {
            solidSection.style.display = 'none';
            gradientSection.style.display = 'block';
        }
    }

    updateGradientPreview() {
        const gradientPreview = document.getElementById('gradient-preview');
        if (gradientPreview) {
            const gradientString = this.generateGradientString();
            gradientPreview.style.background = gradientString;
        }
    }

    updateBackgroundPreview() {
        const backgroundPreview = document.getElementById('background-preview');
        if (backgroundPreview) {
            let backgroundString;
            if (this.backgroundType === 'solid') {
                const solidColor = document.getElementById('custom-background-solid').value;
                backgroundString = solidColor;
            } else {
                backgroundString = this.generateGradientString();
            }
            backgroundPreview.style.background = backgroundString;
        }
    }

    generateGradientString() {
        const colorStops = this.gradientColors.join(', ');
        return `linear-gradient(${this.gradientDirection}, ${colorStops})`;
    }

    addGradientColor() {
        if (this.gradientColors.length < 5) { // Limit to 5 colors
            this.gradientColors.push('#ffffff');
            this.renderGradientColors();
            this.updateGradientPreview();
            this.updateBackgroundPreview();
            this.updatePreview();
        }
    }

    removeGradientColor(index) {
        if (this.gradientColors.length > 2) { // Keep at least 2 colors
            this.gradientColors.splice(index - 1, 1);
            this.renderGradientColors();
            this.updateGradientPreview();
            this.updateBackgroundPreview();
            this.updatePreview();
        }
    }

    renderGradientColors() {
        const container = document.querySelector('.gradient-colors');
        container.innerHTML = '';

        this.gradientColors.forEach((color, index) => {
            const colorIndex = index + 1;
            const colorItem = document.createElement('div');
            colorItem.className = 'gradient-color-item';
            colorItem.innerHTML = `
                <input type="color" class="color-input" id="gradient-color-${colorIndex}" value="${color}">
                <input type="text" class="form-input" id="gradient-color-${colorIndex}-hex" placeholder="${color}">
                <button class="btn btn-danger btn-small" onclick="editor.removeGradientColor(${colorIndex})" ${this.gradientColors.length <= 2 ? 'style="display: none;"' : ''}>Remove</button>
            `;
            container.appendChild(colorItem);
        });

        // Re-setup listeners for new elements
        this.setupGradientColorListeners();
    }

    isValidHex(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    parseBackgroundFromConfig(backgroundString) {
        if (!backgroundString) return { type: 'solid', value: '#ffffff' };
        
        if (backgroundString.startsWith('linear-gradient')) {
            // Parse gradient
            const match = backgroundString.match(/linear-gradient\(([^,]+),\s*(.+)\)/);
            if (match) {
                const direction = match[1].trim();
                const colors = match[2].split(',').map(c => c.trim());
                return { type: 'gradient', direction, colors };
            }
        }
        
        return { type: 'solid', value: backgroundString };
    }

    applyBackgroundFromConfig() {
        const backgroundConfig = this.parseBackgroundFromConfig(this.config.customization?.background);
        
        if (backgroundConfig.type === 'solid') {
            this.backgroundType = 'solid';
            document.getElementById('bg-solid').checked = true;
            document.getElementById('custom-background-solid').value = backgroundConfig.value;
            document.getElementById('custom-background-solid-hex').value = backgroundConfig.value;
        } else {
            this.backgroundType = 'gradient';
            document.getElementById('bg-gradient').checked = true;
            this.gradientDirection = backgroundConfig.direction;
            this.gradientColors = backgroundConfig.colors;
            document.getElementById('gradient-direction').value = backgroundConfig.direction;
            this.renderGradientColors();
        }
        
        // Load container background
        const containerBackground = this.config.customization?.containerBackground || '#ffffff';
        document.getElementById('custom-container-background').value = containerBackground;
        document.getElementById('custom-container-background-hex').value = containerBackground;
        
        this.toggleBackgroundSections();
        this.updateGradientPreview();
        this.updateBackgroundPreview();
    }

    toggleCustomizationSection() {
        const customizationSection = document.getElementById('customization-section');
        if (this.customizationEnabled) {
            customizationSection.classList.remove('disabled');
            customizationSection.classList.add('enabled');
            customizationSection.style.opacity = '1';
            customizationSection.style.pointerEvents = 'auto';
        } else {
            customizationSection.classList.remove('enabled');
            customizationSection.classList.add('disabled');
            customizationSection.style.opacity = '0.5';
            customizationSection.style.pointerEvents = 'none';
            // Clear custom colors and use theme defaults
            this.clearCustomColors();
        }
    }

    clearCustomColors() {
        // Clear customization from config
        this.config.customization = {};
        
        // Reset UI to theme defaults
        const theme = this.currentTheme;
        const defaultAccent = this.getThemeDefaultAccent(theme);
        const defaultText = this.getThemeDefaultText(theme);
        const defaultLink = this.getThemeDefaultLink(theme);
        
        // Update color inputs to theme defaults
        document.getElementById('custom-accent').value = defaultAccent;
        document.getElementById('custom-accent-hex').value = defaultAccent;
        document.getElementById('custom-text').value = defaultText;
        document.getElementById('custom-text-hex').value = defaultText;
        document.getElementById('custom-link').value = defaultLink;
        document.getElementById('custom-link-hex').value = defaultLink;
        
        // Reset background to theme default
        const defaultBackground = this.getThemeDefaultBackground(theme);
        if (defaultBackground.startsWith('linear-gradient')) {
            // Parse gradient and set up gradient UI
            this.backgroundType = 'gradient';
            document.getElementById('bg-gradient').checked = true;
            this.parseAndSetGradient(defaultBackground);
        } else {
            // Set solid color
            this.backgroundType = 'solid';
            document.getElementById('bg-solid').checked = true;
            document.getElementById('custom-background-solid').value = defaultBackground;
            document.getElementById('custom-background-solid-hex').value = defaultBackground;
        }
        
        this.toggleBackgroundSections();
        this.updateGradientPreview();
        this.updateBackgroundPreview();
    }

    parseAndSetGradient(gradientString) {
        // Parse gradient string and set up the gradient UI
        const match = gradientString.match(/linear-gradient\(([^,]+),\s*(.+)\)/);
        if (match) {
            const direction = match[1].trim();
            const colors = match[2].split(',').map(c => c.trim());
            
            this.gradientDirection = direction;
            this.gradientColors = colors;
            
            document.getElementById('gradient-direction').value = direction;
            this.renderGradientColors();
        }
    }

    exportConfig() {
        // Only include customizations if they're enabled
        if (this.customizationEnabled) {
            // Initialize customization object if it doesn't exist
            if (!this.config.customization) {
                this.config.customization = {};
            }
            
            // Set enabled flag
            this.config.customization.enabled = true;
            
            // Update the config with current background settings
            if (this.backgroundType === 'solid') {
                this.config.customization.background = document.getElementById('custom-background-solid').value;
            } else {
                this.config.customization.background = this.generateGradientString();
            }
            
            // Add container background if specified
            const containerBackground = document.getElementById('custom-container-background').value;
            if (containerBackground && containerBackground !== '#ffffff') {
                this.config.customization.containerBackground = containerBackground;
            }
        } else {
            // Clear customizations when using theme defaults
            // Set enabled to false to explicitly disable
            this.config.customization = { enabled: false };
        }
        
        const configJSON = JSON.stringify(this.config, null, 2);
        const blob = new Blob([configJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'link-in-bio-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('Configuration exported successfully!', 'success');
    }

    importConfig() {
        document.getElementById('import-input').click();
    }

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedConfig = JSON.parse(e.target.result);
                this.config = importedConfig;
                this.populateForm();
                this.updatePreview();
                this.showMessage('Configuration imported successfully!', 'success');
            } catch (error) {
                this.showMessage('Error importing configuration. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    previewPage() {
        // Create a data URL with the configuration
        const configJSON = JSON.stringify(this.config, null, 2);
        
        // Create a preview HTML page
        const previewHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - ${this.config.profile?.name || 'Link-in-Bio'}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🔗%3C/text%3E%3C/svg%3E">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .loading { display: none !important; }
        .hidden { display: none !important; }
    </style>
</head>
<body>
    <div id="loading" class="loading">Loading...</div>
    <div id="app"></div>
    <div id="error" class="hidden"></div>
    
    <script>
        // Inject the configuration
        window.previewConfig = ${configJSON};
        
        // Override fetch to return our config
        const originalFetch = window.fetch;
        window.fetch = function(url) {
            if (url.includes('data.json')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(window.previewConfig)
                });
            }
            return originalFetch(url);
        };
        
        // Load the renderer script
        const script = document.createElement('script');
        script.src = './script.js';
        script.onload = function() {
            if (window.UniversalLinkRenderer) {
                new window.UniversalLinkRenderer();
            }
        };
        document.head.appendChild(script);
    </script>
</body>
</html>`;
        
        // Create blob and open in new tab
        const blob = new Blob([previewHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
            this.showMessage('Preview opened in new tab!', 'success');
        } else {
            this.showMessage('Please allow popups to view the preview.', 'error');
        }
        
        // Clean up the URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        
        container.innerHTML = '';
        container.appendChild(messageDiv);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
function loadTemplate() {
    editor.loadDefaultTemplate();
}

function exportConfig() {
    editor.exportConfig();
}

function importConfig() {
    editor.importConfig();
}

function previewPage() {
    editor.previewPage();
}

function addLink() {
    editor.addLink();
}

function addGradientColor() {
    editor.addGradientColor();
}

function removeGradientColor(index) {
    editor.removeGradientColor(index);
}

// Initialize the editor when the page loads
let editor;
document.addEventListener('DOMContentLoaded', () => {
    editor = new LinkBioEditor();
});
