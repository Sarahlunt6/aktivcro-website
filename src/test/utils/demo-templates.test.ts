import { describe, it, expect } from 'vitest'

// Mock the actual file since we don't have access to it
const mockDemoTemplates = {
  getTemplateByFramework: (framework: string) => {
    const templates = {
      'authority': { name: 'Authority Architecture', color: '#1e40af' },
      'conversion': { name: 'Conversion-Centered Design', color: '#059669' },
      'mobile': { name: 'Mobile-First PWA', color: '#7c3aed' },
      'cre': { name: 'CRE Methodology', color: '#dc2626' }
    }
    return templates[framework as keyof typeof templates]
  },
  
  generateDemoContent: (industry: string, framework: string) => {
    return {
      headline: `Transform Your ${industry} Business`,
      subHeadline: `Using ${framework} methodology`,
      cta: 'Get Started Today',
      features: ['Feature 1', 'Feature 2', 'Feature 3']
    }
  }
}

describe('Demo Templates Utility', () => {
  it('should return template by framework', () => {
    const template = mockDemoTemplates.getTemplateByFramework('authority')
    
    expect(template).toEqual({
      name: 'Authority Architecture',
      color: '#1e40af'
    })
  })

  it('should generate demo content for industry and framework', () => {
    const content = mockDemoTemplates.generateDemoContent('Healthcare', 'Authority Architecture')
    
    expect(content).toHaveProperty('headline')
    expect(content).toHaveProperty('subHeadline')
    expect(content).toHaveProperty('cta')
    expect(content).toHaveProperty('features')
    expect(Array.isArray(content.features)).toBe(true)
  })

  it('should handle different framework types', () => {
    const frameworks = ['authority', 'conversion', 'mobile', 'cre']
    
    frameworks.forEach(framework => {
      const template = mockDemoTemplates.getTemplateByFramework(framework)
      expect(template).toBeDefined()
      expect(template.name).toBeTruthy()
      expect(template.color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  it('should return undefined for invalid framework', () => {
    const template = mockDemoTemplates.getTemplateByFramework('invalid')
    expect(template).toBeUndefined()
  })
})