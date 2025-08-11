/**
 * GDPR Compliance Manager
 * Handles data privacy, consent management, and user rights under GDPR
 */

export interface UserDataRecord {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  source: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  consentGiven: boolean;
  consentTimestamp: string;
  dataTypes: DataType[];
}

export interface DataType {
  category: 'contact' | 'analytics' | 'marketing' | 'functional';
  description: string;
  lawfulBasis: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation';
  retentionPeriod: string; // e.g., "2 years", "until consent withdrawn"
}

export interface DataProcessingRecord {
  purpose: string;
  dataTypes: string[];
  lawfulBasis: string;
  retentionPeriod: string;
  thirdParties?: string[];
}

export interface ConsentRecord {
  userId: string;
  consentType: 'analytics' | 'marketing' | 'functional';
  granted: boolean;
  timestamp: string;
  method: 'cookie_banner' | 'form_checkbox' | 'email_link';
  ipAddress?: string;
  userAgent?: string;
}

class GDPRManager {
  private readonly CONSENT_STORAGE_KEY = 'gdpr_consent_records';
  private readonly USER_DATA_STORAGE_KEY = 'gdpr_user_data';

  // Data Processing Activities Register
  private readonly DATA_PROCESSING_ACTIVITIES: DataProcessingRecord[] = [
    {
      purpose: 'Lead Generation and Customer Communication',
      dataTypes: ['email', 'name', 'phone', 'company', 'ip_address'],
      lawfulBasis: 'consent',
      retentionPeriod: '3 years from last contact',
      thirdParties: ['GoHighLevel (CRM)', 'Email service provider']
    },
    {
      purpose: 'Website Analytics and Performance Monitoring',
      dataTypes: ['ip_address', 'browser_info', 'page_views', 'session_data'],
      lawfulBasis: 'legitimate_interest',
      retentionPeriod: '2 years',
      thirdParties: ['Google Analytics', 'Microsoft Clarity']
    },
    {
      purpose: 'Marketing and Advertising',
      dataTypes: ['email', 'behavioral_data', 'preferences'],
      lawfulBasis: 'consent',
      retentionPeriod: 'Until consent is withdrawn',
      thirdParties: ['Social media platforms', 'Ad networks']
    },
    {
      purpose: 'Website Functionality and User Experience',
      dataTypes: ['preferences', 'session_data', 'form_data'],
      lawfulBasis: 'legitimate_interest',
      retentionPeriod: '1 year',
      thirdParties: []
    }
  ];

  /**
   * Record user consent
   */
  recordConsent(consent: ConsentRecord): void {
    try {
      const existingRecords = this.getConsentRecords();
      const newRecord = {
        ...consent,
        timestamp: new Date().toISOString(),
        id: this.generateId()
      };
      
      existingRecords.push(newRecord);
      localStorage.setItem(this.CONSENT_STORAGE_KEY, JSON.stringify(existingRecords));
      
      console.log('GDPR: Consent recorded', { type: consent.consentType, granted: consent.granted });
    } catch (error) {
      console.error('GDPR: Failed to record consent', error);
    }
  }

  /**
   * Get all consent records for a user
   */
  getConsentRecords(userId?: string): ConsentRecord[] {
    try {
      const stored = localStorage.getItem(this.CONSENT_STORAGE_KEY);
      const records: ConsentRecord[] = stored ? JSON.parse(stored) : [];
      
      return userId ? records.filter(record => record.userId === userId) : records;
    } catch (error) {
      console.error('GDPR: Failed to retrieve consent records', error);
      return [];
    }
  }

  /**
   * Record user data collection
   */
  recordDataCollection(userData: Omit<UserDataRecord, 'id' | 'timestamp'>): string {
    try {
      const userId = this.generateId();
      const record: UserDataRecord = {
        ...userData,
        id: userId,
        timestamp: new Date().toISOString()
      };

      const existingData = this.getUserDataRecords();
      existingData.push(record);
      localStorage.setItem(this.USER_DATA_STORAGE_KEY, JSON.stringify(existingData));
      
      console.log('GDPR: User data recorded', { userId, email: userData.email, source: userData.source });
      return userId;
    } catch (error) {
      console.error('GDPR: Failed to record user data', error);
      return '';
    }
  }

  /**
   * Get all user data records
   */
  getUserDataRecords(email?: string): UserDataRecord[] {
    try {
      const stored = localStorage.getItem(this.USER_DATA_STORAGE_KEY);
      const records: UserDataRecord[] = stored ? JSON.parse(stored) : [];
      
      return email ? records.filter(record => record.email === email) : records;
    } catch (error) {
      console.error('GDPR: Failed to retrieve user data records', error);
      return [];
    }
  }

  /**
   * Export all data for a specific user (Right to Data Portability)
   */
  exportUserData(email: string): any {
    try {
      const userDataRecords = this.getUserDataRecords(email);
      const consentRecords = this.getConsentRecords();
      const userConsents = consentRecords.filter(record => 
        userDataRecords.some(userData => userData.id === record.userId)
      );

      const exportData = {
        exportDate: new Date().toISOString(),
        userEmail: email,
        personalData: userDataRecords,
        consentHistory: userConsents,
        dataProcessingActivities: this.DATA_PROCESSING_ACTIVITIES,
        retentionNotice: 'Data will be retained according to our privacy policy and legal requirements.'
      };

      console.log('GDPR: Data export generated for', email);
      return exportData;
    } catch (error) {
      console.error('GDPR: Failed to export user data', error);
      return null;
    }
  }

  /**
   * Delete all data for a specific user (Right to Erasure)
   */
  deleteUserData(email: string): boolean {
    try {
      // Remove user data records
      const userDataRecords = this.getUserDataRecords();
      const filteredUserData = userDataRecords.filter(record => record.email !== email);
      localStorage.setItem(this.USER_DATA_STORAGE_KEY, JSON.stringify(filteredUserData));

      // Remove consent records
      const consentRecords = this.getConsentRecords();
      const userIds = userDataRecords
        .filter(record => record.email === email)
        .map(record => record.id);
      
      const filteredConsents = consentRecords.filter(record => !userIds.includes(record.userId));
      localStorage.setItem(this.CONSENT_STORAGE_KEY, JSON.stringify(filteredConsents));

      console.log('GDPR: User data deleted for', email);
      return true;
    } catch (error) {
      console.error('GDPR: Failed to delete user data', error);
      return false;
    }
  }

  /**
   * Update user consent preferences
   */
  updateConsent(userId: string, consentType: ConsentRecord['consentType'], granted: boolean): void {
    this.recordConsent({
      userId,
      consentType,
      granted,
      timestamp: new Date().toISOString(),
      method: 'cookie_banner',
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    });
  }

  /**
   * Check if user has given specific consent
   */
  hasConsent(userId: string, consentType: ConsentRecord['consentType']): boolean {
    const records = this.getConsentRecords(userId);
    const latestRecord = records
      .filter(record => record.consentType === consentType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return latestRecord?.granted || false;
  }

  /**
   * Generate data processing transparency report
   */
  generateTransparencyReport(): any {
    return {
      generatedAt: new Date().toISOString(),
      dataProcessingActivities: this.DATA_PROCESSING_ACTIVITIES,
      userRights: [
        {
          right: 'Right to Information',
          description: 'You have the right to know what personal data we collect and how we use it.',
          howToExercise: 'Review our privacy policy or contact us directly.'
        },
        {
          right: 'Right of Access',
          description: 'You have the right to request access to your personal data.',
          howToExercise: 'Use our data export feature or contact us directly.'
        },
        {
          right: 'Right to Rectification',
          description: 'You have the right to correct inaccurate personal data.',
          howToExercise: 'Contact us to update your information.'
        },
        {
          right: 'Right to Erasure (Right to be Forgotten)',
          description: 'You have the right to request deletion of your personal data.',
          howToExercise: 'Use our data deletion feature or contact us directly.'
        },
        {
          right: 'Right to Restrict Processing',
          description: 'You have the right to limit how we process your personal data.',
          howToExercise: 'Contact us to discuss processing restrictions.'
        },
        {
          right: 'Right to Data Portability',
          description: 'You have the right to receive your personal data in a portable format.',
          howToExercise: 'Use our data export feature.'
        },
        {
          right: 'Right to Object',
          description: 'You have the right to object to processing of your personal data.',
          howToExercise: 'Withdraw consent through cookie settings or contact us.'
        }
      ],
      contactInformation: {
        dataController: 'AktivCRO',
        email: 'privacy@aktivcro.com',
        address: 'Contact information available in privacy policy'
      },
      retentionPolicies: this.DATA_PROCESSING_ACTIVITIES.map(activity => ({
        purpose: activity.purpose,
        retentionPeriod: activity.retentionPeriod
      }))
    };
  }

  /**
   * Validate data retention and cleanup expired data
   */
  cleanupExpiredData(): void {
    try {
      const userDataRecords = this.getUserDataRecords();
      const now = new Date().getTime();
      const threeYearsAgo = now - (3 * 365 * 24 * 60 * 60 * 1000); // 3 years in milliseconds

      const activeRecords = userDataRecords.filter(record => {
        const recordDate = new Date(record.timestamp).getTime();
        return recordDate > threeYearsAgo;
      });

      if (activeRecords.length !== userDataRecords.length) {
        localStorage.setItem(this.USER_DATA_STORAGE_KEY, JSON.stringify(activeRecords));
        console.log('GDPR: Expired data cleaned up', {
          removed: userDataRecords.length - activeRecords.length,
          remaining: activeRecords.length
        });
      }
    } catch (error) {
      console.error('GDPR: Failed to cleanup expired data', error);
    }
  }

  /**
   * Get client IP (best effort)
   */
  private getClientIP(): string | undefined {
    // This would need server-side implementation for accurate IP
    return undefined;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `gdpr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
const gdprManager = new GDPRManager();

// Convenience functions
export function recordUserConsent(
  userId: string,
  consentType: ConsentRecord['consentType'],
  granted: boolean
): void {
  gdprManager.recordConsent({
    userId,
    consentType,
    granted,
    timestamp: new Date().toISOString(),
    method: 'cookie_banner',
    userAgent: navigator.userAgent
  });
}

export function recordLeadData(leadData: {
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  source: string;
  consentGiven: boolean;
}): string {
  return gdprManager.recordDataCollection({
    ...leadData,
    consentTimestamp: new Date().toISOString(),
    dataTypes: [
      {
        category: 'contact',
        description: 'Contact information for communication',
        lawfulBasis: 'consent',
        retentionPeriod: '3 years'
      }
    ]
  });
}

export function exportMyData(email: string): any {
  return gdprManager.exportUserData(email);
}

export function deleteMyData(email: string): boolean {
  return gdprManager.deleteUserData(email);
}

export function hasUserConsent(userId: string, type: ConsentRecord['consentType']): boolean {
  return gdprManager.hasConsent(userId, type);
}

// Initialize cleanup on load
if (typeof window !== 'undefined') {
  gdprManager.cleanupExpiredData();
}

export default gdprManager;