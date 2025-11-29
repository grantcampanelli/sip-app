# Advanced Prompt Engineering System

## Overview

This wine/spirits collection application features a sophisticated prompt engineering system designed to deliver contextually aware, expert-level analysis of beverages. The system demonstrates advanced prompt engineering techniques including context injection, persona modeling, and adaptive response formatting.

## Architecture

### Core Components

1. **PromptEngineeringManager** (`lib/prompt-engineering.ts`)
   - Singleton pattern for centralized prompt configuration
   - Multiple persona variations (Expert, Enthusiast, Beginner)
   - Context-aware prompt building with product-specific intelligence

2. **Chat API** (`pages/api/chat/index.tsx`) 
   - Clean, scalable API design using the prompt engineering library
   - Structured response formatting with metadata tracking
   - Error handling and fallback mechanisms

3. **Enhanced UI** (`pages/bottles/[id]/index.tsx`)
   - Dynamic variation selection
   - Real-time prompt customization
   - Response metadata display for transparency

## Prompt Engineering Techniques

### 1. **Sophisticated Persona Engineering**

The system implements three distinct AI personas, each with carefully crafted system prompts:

- **Expert Sommelier**: Technical, authoritative analysis for professionals
- **Wine Enthusiast**: Engaging, story-driven content for collectors  
- **Beginner-Friendly**: Educational, accessible guidance for newcomers

### 2. **Context-Aware Prompt Construction**

Prompts are dynamically built using rich product context:

```typescript
interface ProductContext {
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
```

### 3. **Structured Request Templates**

Different beverage types (wine, spirits, beer) receive customized prompt structures:

- **Wine**: Terroir analysis, vintage evaluation, winemaking techniques
- **Spirits**: Production details, aging analysis, proof considerations  
- **Beer**: Brewing specifics, style evaluation, freshness factors

### 4. **Progressive Information Architecture**

Each prompt follows a logical flow:
1. Producer background and credibility
2. Product-specific technical details
3. Sensory analysis and tasting notes
4. Food pairing recommendations
5. Collection and storage guidance

## Key Features

### Dynamic Prompt Variation
Users can select between different analysis styles in real-time, allowing comparison of the same product through different expert lenses.

### Rich Context Injection
The system incorporates user-specific data (purchase price, personal notes, consumption level) to provide personalized insights.

### Metadata Transparency
Every response includes detailed metadata showing:
- Prompt variation used
- Model configuration
- Token consumption
- Generation timestamp

### Structured Response Formatting
Responses follow consistent markdown formatting with clear sections for easy scanning and comprehension.

## Technical Implementation

### Prompt Temperature Optimization
- Expert: 0.6 (more focused, technical)
- Enthusiast: 0.8 (more creative, engaging)
- Beginner: 0.7 (balanced approach)

### Token Management
- Maximum 1500 tokens for comprehensive yet focused responses
- Token tracking for cost optimization

### Error Handling
- Graceful degradation for missing context
- User-friendly error messages
- Fallback to simple prompt structure when needed

## Usage Examples

### Expert Analysis Request
```typescript
const context = {
    productName: "Cabernet Sauvignon",
    brandName: "Opus One",
    brandType: BrandType.WINE,
    vintage: "2018",
    region: "Napa Valley",
    purchasePrice: 450,
    // ... other context
};

const prompt = buildProductPrompt(context, 'expert');
```

### Beginner-Friendly Analysis
```typescript
const prompt = buildProductPrompt(context, 'beginner', 
    "Please explain technical terms clearly");
```

## Prompt Engineering Best Practices Demonstrated

1. **Clear Role Definition**: Each persona has explicit expertise areas and communication style
2. **Context Integration**: User data seamlessly woven into prompt narrative
3. **Structured Output**: Consistent formatting improves usability
4. **Adaptive Complexity**: Content sophistication matches user expertise level
5. **Transparent Methodology**: System behavior is observable and adjustable

## Future Enhancements

- A/B testing framework for prompt optimization
- User feedback integration for continuous improvement
- Multi-language support with cultural adaptation
- Integration with external wine/spirits databases
- Personalization based on user tasting history

## Performance Considerations

- Singleton pattern prevents repeated initialization
- Cached prompt templates for efficiency
- Structured codebase for maintainability
- Comprehensive error handling for reliability

This system represents enterprise-grade prompt engineering, combining technical sophistication with practical usability to deliver exceptional AI-powered beverage analysis.
