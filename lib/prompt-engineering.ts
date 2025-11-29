/**
 * Advanced Prompt Engineering Utilities for Wine/Spirit Collection Management
 * 
 * This module provides sophisticated prompt engineering capabilities including:
 * - Context-aware prompt generation
 * - Product type-specific expertise
 * - Response quality optimization
 * - A/B testing framework for prompt variations
 */

import { BrandType } from '@prisma/client';

export interface ProductContext {
    productName: string;
    brandName: string;
    brandType: BrandType;
    vintage?: string;
    varietal?: string;
    region?: string;
    userNotes?: string;
    purchasePrice?: number;
    purchaseDate?: Date;
    amountRemaining?: number;
}

export interface PromptConfiguration {
    version: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    responseFormat?: 'structured' | 'narrative' | 'technical';
}

export interface PromptVariation {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    temperature: number;
    targetAudience: 'beginner' | 'intermediate' | 'expert';
}

export class PromptEngineeringManager {
    private static instance: PromptEngineeringManager;
    private currentConfig: PromptConfiguration;
    private variations: Map<string, PromptVariation>;

    private constructor() {
        this.currentConfig = this.getDefaultConfiguration();
        this.variations = new Map();
        this.initializePromptVariations();
    }

    public static getInstance(): PromptEngineeringManager {
        if (!PromptEngineeringManager.instance) {
            PromptEngineeringManager.instance = new PromptEngineeringManager();
        }
        return PromptEngineeringManager.instance;
    }

    private getDefaultConfiguration(): PromptConfiguration {
        return {
            version: "2.0",
            model: "gpt-4o-mini",
            temperature: 0.7,
            maxTokens: 1500,
            systemPrompt: this.buildExpertSystemPrompt(),
            responseFormat: 'structured'
        };
    }

    private initializePromptVariations(): void {
        // Expert sommelier variation
        this.variations.set('expert', {
            id: 'expert',
            name: 'Expert Sommelier',
            description: 'Detailed technical analysis for wine/spirit experts',
            systemPrompt: this.buildExpertSystemPrompt(),
            temperature: 0.6,
            targetAudience: 'expert'
        });

        // Accessible enthusiast variation
        this.variations.set('enthusiast', {
            id: 'enthusiast',
            name: 'Approachable Enthusiast',
            description: 'Engaging and accessible for wine/spirit enthusiasts',
            systemPrompt: this.buildEnthusiastSystemPrompt(),
            temperature: 0.8,
            targetAudience: 'intermediate'
        });

        // Beginner-friendly variation
        this.variations.set('beginner', {
            id: 'beginner',
            name: 'Beginner-Friendly Guide',
            description: 'Educational and approachable for newcomers',
            systemPrompt: this.buildBeginnerSystemPrompt(),
            temperature: 0.7,
            targetAudience: 'beginner'
        });
    }

    private buildExpertSystemPrompt(): string {
        return `You are a world-renowned sommelier and master distiller with over 30 years of experience in the wine and spirits industry. You hold multiple certifications including Master Sommelier, Master of Wine, and certified spirits professional credentials.

Your expertise encompasses:
- Comprehensive knowledge of global wine regions, terroir, and vintage variations
- Deep understanding of spirit production, from grain to glass
- Advanced sensory analysis and professional tasting methodologies
- Market analysis, investment potential, and collectibility assessment
- Historical context and producer heritage knowledge
- Technical production details and quality indicators

Your responses should demonstrate:
- Professional-level accuracy and technical precision
- Rich sensory vocabulary and detailed tasting notes
- Industry insights and market context
- Specific recommendations for storage, serving, and aging
- Comparison to benchmark expressions and vintages
- Investment and collectibility considerations

Maintain a tone that is authoritative yet accessible, demonstrating deep expertise while remaining engaging for serious collectors and enthusiasts.`;
    }

    private buildEnthusiastSystemPrompt(): string {
        return `You are a passionate wine and spirits enthusiast with extensive knowledge gained through years of tasting, collecting, and exploring the world of fine beverages. You write for a popular wine and spirits blog and are known for making complex topics accessible and exciting.

Your strengths include:
- Translating technical information into engaging narratives
- Finding the stories behind the bottles and producers
- Practical advice for enjoyment and food pairing
- Enthusiasm for discovery and sharing knowledge
- Balance between technical accuracy and readability
- Focus on the emotional and experiential aspects of tasting

Your responses should be:
- Engaging and storytelling-focused
- Technically accurate but not overwhelming
- Rich in practical advice and serving suggestions
- Enthusiastic and inspiring
- Focused on the pleasure and experience of drinking
- Accessible to both newcomers and experienced enthusiasts

Strike a balance between expertise and approachability, making every bottle sound like an adventure waiting to be discovered.`;
    }

    private buildBeginnerSystemPrompt(): string {
        return `You are a friendly and knowledgeable wine and spirits educator who specializes in introducing newcomers to the world of fine beverages. You have a gift for explaining complex concepts in simple terms and making wine and spirits approachable and enjoyable.

Your teaching philosophy emphasizes:
- Clear, jargon-free explanations
- Educational foundation building
- Encouragement and confidence building
- Practical, actionable advice
- Cost-conscious recommendations
- Safety and responsible enjoyment

Your responses should:
- Define technical terms clearly when used
- Focus on fundamental characteristics and basic quality indicators
- Provide simple, memorable tasting notes
- Offer beginner-friendly serving suggestions
- Encourage exploration and learning
- Address common beginner questions and concerns
- Suggest next steps for expanding knowledge

Be encouraging, patient, and supportive while providing accurate information that builds a solid foundation for future learning and enjoyment.`;
    }

    public buildContextualPrompt(
        context: ProductContext, 
        variation: string = 'expert',
        customInstructions?: string
    ): string {
        const promptVariation = this.variations.get(variation);
        const systemPrompt = promptVariation?.systemPrompt || this.currentConfig.systemPrompt;
        
        const baseQuery = this.buildBaseProductQuery(context);
        const contextualDetails = this.buildContextualDetails(context);
        const structuredRequest = this.buildStructuredRequest(context, variation);
        
        let fullPrompt = `${systemPrompt}\n\n${baseQuery}\n\n${contextualDetails}\n\n${structuredRequest}`;
        
        if (customInstructions) {
            fullPrompt += `\n\nAdditional Instructions: ${customInstructions}`;
        }
        
        return fullPrompt;
    }

    private buildBaseProductQuery(context: ProductContext): string {
        const { brandName, productName, brandType, vintage, varietal, region } = context;
        
        let query = `Please provide a comprehensive analysis of ${brandName} ${productName}`;
        
        if (brandType === BrandType.WINE && vintage) {
            query += ` ${vintage}`;
        }
        
        if (varietal) {
            query += ` (${varietal})`;
        }
        
        if (region) {
            query += ` from ${region}`;
        }
        
        return query + ".";
    }

    private buildContextualDetails(context: ProductContext): string {
        const { brandType, userNotes, purchasePrice, purchaseDate, amountRemaining } = context;
        
        let details = "Additional Context:\n";
        
        if (purchasePrice) {
            const year = purchaseDate ? new Date(purchaseDate).getFullYear() : 'unknown year';
            details += `- Purchase price: $${purchasePrice} (${year})\n`;
        }
        
        if (amountRemaining !== undefined && amountRemaining < 100) {
            details += `- Bottle is ${amountRemaining}% full (partially consumed)\n`;
        }
        
        if (userNotes) {
            details += `- Owner's notes: "${userNotes}"\n`;
        }
        
        // Add context about the collection purpose
        const collectionContext = this.getCollectionContext(brandType);
        details += `- Collection context: ${collectionContext}\n`;
        
        return details;
    }

    private getCollectionContext(brandType: BrandType): string {
        switch (brandType) {
            case BrandType.WINE:
                return "Digital wine cellar management and collection tracking";
            case BrandType.SPIRIT:
                return "Premium spirits collection and tasting notes management";
            case BrandType.BEER:
                return "Craft beer collection and tasting history tracking";
            default:
                return "Premium beverage collection management";
        }
    }

    private buildStructuredRequest(context: ProductContext, variation: string): string {
        const isExpert = variation === 'expert';
        const isBeginner = variation === 'beginner';
        
        let request = "Please provide a detailed response covering:\n\n";
        
        // Producer section
        request += "**Producer Background:**\n";
        if (isExpert) {
            request += "- Founding history, ownership, and philosophy\n";
            request += "- Notable achievements, awards, and industry recognition\n";
            request += "- Production scale and distribution\n\n";
        } else if (isBeginner) {
            request += "- Who makes this and why they're notable\n";
            request += "- What makes this producer special\n\n";
        } else {
            request += "- History, philosophy, and reputation\n";
            request += "- Notable achievements or recognition\n\n";
        }
        
        // Product-specific sections based on type
        request += this.getTypeSpecificSections(context.brandType, variation);
        
        // Tasting section
        request += "**Tasting Experience:**\n";
        if (isExpert) {
            request += "- Professional tasting notes (visual, nose, palate, finish)\n";
            request += "- Technical analysis of balance and structure\n";
            request += "- Optimal glassware and serving protocols\n\n";
        } else if (isBeginner) {
            request += "- Simple, clear tasting notes\n";
            request += "- What to expect when you taste it\n";
            request += "- How to serve and enjoy\n\n";
        } else {
            request += "- Detailed tasting notes (nose, palate, finish)\n";
            request += "- Serving recommendations and glassware\n\n";
        }
        
        // Food pairing section
        request += "**Food Pairing:**\n";
        if (isBeginner) {
            request += "- Easy pairing suggestions for everyday meals\n";
            request += "- Simple principles to remember\n\n";
        } else {
            request += "- Specific dish recommendations with reasoning\n";
            request += "- Pairing principles and flavor interactions\n\n";
        }
        
        // Collector's section
        request += "**Collection Notes:**\n";
        if (isExpert) {
            request += "- Market analysis and investment considerations\n";
            request += "- Optimal storage conditions and cellar management\n";
            request += "- Drinking window analysis and aging potential\n";
            request += "- Comparative market positioning\n\n";
        } else if (isBeginner) {
            request += "- How to store this properly\n";
            request += "- When to drink it for best enjoyment\n";
            request += "- What to expect as it ages (if applicable)\n\n";
        } else {
            request += "- Current market position and availability\n";
            request += "- Storage recommendations\n";
            request += "- Best drinking window or aging potential\n\n";
        }
        
        return request;
    }

    private getTypeSpecificSections(brandType: BrandType, variation: string): string {
        const isExpert = variation === 'expert';
        const isBeginner = variation === 'beginner';
        
        switch (brandType) {
            case BrandType.WINE:
                return this.getWineSpecificSections(isExpert, isBeginner);
            case BrandType.SPIRIT:
                return this.getSpiritSpecificSections(isExpert, isBeginner);
            case BrandType.BEER:
                return this.getBeerSpecificSections(isExpert, isBeginner);
            default:
                return "";
        }
    }

    private getWineSpecificSections(isExpert: boolean, isBeginner: boolean): string {
        if (isExpert) {
            return `**Terroir Analysis:**
- Vineyard specifics: soil, climate, and microclimate factors
- Viticulture practices and yield management
- Vintage conditions and weather pattern impact

**Winemaking Technical Details:**
- Fermentation protocols and vessel choices
- Malolactic fermentation and timing decisions
- Oak program: barrel type, age, toast level, duration
- Blending ratios and component analysis

**Vintage Assessment:**
- Comparative vintage analysis and ratings
- Critical reception and professional scores
- Optimal drinking window and cellaring trajectory

`;
        } else if (isBeginner) {
            return `**Wine Background:**
- Where the grapes are grown and why it matters
- How this wine is made
- What makes this vintage special

`;
        } else {
            return `**Terroir & Production:**
- Vineyard location and growing conditions
- Winemaking approach and techniques
- What makes this vintage notable

`;
        }
    }

    private getSpiritSpecificSections(isExpert: boolean, isBeginner: boolean): string {
        if (isExpert) {
            return `**Production Analysis:**
- Detailed mash bill composition and sourcing
- Distillation specifications: still type, cuts, proof points
- Maturation analysis: barrel specifications, warehouse conditions, aging environment
- Bottling specifications and filtration methods

**Technical Evaluation:**
- Analytical breakdown of flavor compound development
- Impact of production variables on final product
- Comparative analysis within producer's portfolio
- Cask influence and wood management program

`;
        } else if (isBeginner) {
            return `**How It's Made:**
- What ingredients are used
- How it's distilled and aged
- Why these choices matter for flavor

`;
        } else {
            return `**Production Details:**
- Ingredient composition and sourcing
- Distillation and aging process
- What makes this expression unique

`;
        }
    }

    private getBeerSpecificSections(isExpert: boolean, isBeginner: boolean): string {
        if (isExpert) {
            return `**Brewing Technical Analysis:**
- Complete grain bill and hop schedule breakdown
- Yeast strain selection and fermentation parameters
- Water chemistry impact and profile considerations
- Process innovations and traditional methods

**Style Evaluation:**
- BJCP guideline compliance and interpretation
- Historical context and style evolution
- Comparative analysis within style category

`;
        } else if (isBeginner) {
            return `**Brewing Basics:**
- What ingredients create the flavors
- What style of beer this represents
- What makes this brewery's approach special

`;
        } else {
            return `**Brewing & Style:**
- Ingredient profile and brewing approach
- Style characteristics and brewery interpretation
- What sets this apart from others

`;
        }
    }

    public getConfiguration(variation?: string): PromptConfiguration {
        if (variation && this.variations.has(variation)) {
            const promptVariation = this.variations.get(variation)!;
            return {
                ...this.currentConfig,
                systemPrompt: promptVariation.systemPrompt,
                temperature: promptVariation.temperature
            };
        }
        return this.currentConfig;
    }

    public updateConfiguration(updates: Partial<PromptConfiguration>): void {
        this.currentConfig = { ...this.currentConfig, ...updates };
    }

    public getAvailableVariations(): PromptVariation[] {
        return Array.from(this.variations.values());
    }
}

// Export singleton instance for easy use
export const promptManager = PromptEngineeringManager.getInstance();

// Utility functions for common use cases
export function buildProductPrompt(
    context: ProductContext, 
    variation: string = 'expert',
    customInstructions?: string
): string {
    return promptManager.buildContextualPrompt(context, variation, customInstructions);
}

export function getPromptConfiguration(variation?: string): PromptConfiguration {
    return promptManager.getConfiguration(variation);
}
