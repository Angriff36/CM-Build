#!/usr/bin/env node

/**
 * Resilience Drill Verification Checklist
 *
 * This script verifies that all acceptance criteria for the resilience drill task
 * have been met and generates a final verification report.
 */

const fs = require('fs');
const path = require('path');

class ResilienceDrillVerification {
  constructor() {
    this.verificationResults = [];
    this.acceptanceCriteria = [
      {
        id: 'drills-executed',
        description: 'Drills executed across all scenarios',
        required: true,
        verified: false,
      },
      {
        id: 'issues-logged',
        description: 'Issues logged and tracked in follow-up tickets',
        required: true,
        verified: false,
      },
      {
        id: 'ui-banners-accessible',
        description: 'UI banners accessible with proper styling and messaging',
        required: true,
        verified: false,
      },
      {
        id: 'docs-link-tickets',
        description: 'Documentation links to follow-up tickets',
        required: true,
        verified: false,
      },
    ];
  }

  async runVerification() {
    console.log('🔍 Running Resilience Drill Verification Checklist');
    console.log('');

    // Verify each acceptance criterion
    for (const criterion of this.acceptanceCriteria) {
      console.log(`📋 Verifying: ${criterion.description}`);
      const result = await this.verifyCriterion(criterion);
      criterion.verified = result.passed;
      this.verificationResults.push(result);
      console.log(`   ${result.passed ? '✅ PASSED' : '❌ FAILED'}: ${result.message}`);
      console.log('');
    }

    await this.generateVerificationReport();
    this.printSummary();
  }

  async verifyCriterion(criterion) {
    switch (criterion.id) {
      case 'drills-executed':
        return await this.verifyDrillsExecuted();
      case 'issues-logged':
        return await this.verifyIssuesLogged();
      case 'ui-banners-accessible':
        return await this.verifyUIBanners();
      case 'docs-link-tickets':
        return await this.verifyDocsLinkTickets();
      default:
        return { passed: false, message: 'Unknown criterion' };
    }
  }

  async verifyDrillsExecuted() {
    try {
      // Check if drill results exist
      const resultsPath = path.join(__dirname, '../resilience-drill-results.json');
      if (!fs.existsSync(resultsPath)) {
        return { passed: false, message: 'Drill results file not found' };
      }

      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      const drillCount = results.results.length;

      if (drillCount < 6) {
        return { passed: false, message: `Only ${drillCount} drills executed, expected 6` };
      }

      const passedCount = results.results.filter((r) => r.status === 'PASSED').length;
      const issuesCount = results.results.filter((r) => r.status === 'PASSED_WITH_ISSUES').length;
      const failedCount = results.results.filter((r) => r.status === 'FAILED').length;

      if (failedCount > 0) {
        return { passed: false, message: `${failedCount} drills failed` };
      }

      return {
        passed: true,
        message: `All ${drillCount} drills executed (${passedCount} passed, ${issuesCount} with issues)`,
      };
    } catch (error) {
      return { passed: false, message: `Error verifying drills: ${error.message}` };
    }
  }

  async verifyIssuesLogged() {
    try {
      const resultsPath = path.join(__dirname, '../resilience-drill-results.json');
      if (!fs.existsSync(resultsPath)) {
        return { passed: false, message: 'Drill results file not found' };
      }

      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      const drillsWithFollowups = results.results.filter(
        (r) => r.followups && r.followups.length > 0,
      );

      if (drillsWithFollowups.length === 0) {
        return { passed: false, message: 'No follow-up items identified' };
      }

      // Check if resilience report mentions follow-up tickets
      const reportPath = path.join(__dirname, '../../docs/operations/resilience_report.md');
      if (!fs.existsSync(reportPath)) {
        return { passed: false, message: 'Resilience report not found' };
      }

      const reportContent = fs.readFileSync(reportPath, 'utf8');
      const hasTicketReferences =
        reportContent.includes('RES-001') ||
        reportContent.includes('Follow-up Tickets') ||
        reportContent.includes('github.com/sst/opencode/issues');

      if (!hasTicketReferences) {
        return { passed: false, message: 'No ticket references found in documentation' };
      }

      return {
        passed: true,
        message: `${drillsWithFollowups.length} drills have follow-ups, tickets documented`,
      };
    } catch (error) {
      return { passed: false, message: `Error verifying issues: ${error.message}` };
    }
  }

  async verifyUIBanners() {
    try {
      // Check if offline banner components exist
      const prepchefBannerPath = path.join(
        __dirname,
        '../../apps/prepchef/components/offline-banner.tsx',
      );
      const displayBannerPath = path.join(
        __dirname,
        '../../apps/display/components/offline-banner.tsx',
      );

      if (!fs.existsSync(prepchefBannerPath)) {
        return { passed: false, message: 'PrepChef offline banner component not found' };
      }

      if (!fs.existsSync(displayBannerPath)) {
        return { passed: false, message: 'Display offline banner component not found' };
      }

      // Verify banner content includes telemetry and accessibility
      const prepchefContent = fs.readFileSync(prepchefBannerPath, 'utf8');
      const displayContent = fs.readFileSync(displayBannerPath, 'utf8');

      const hasTelemetry =
        prepchefContent.includes('telemetry') && displayContent.includes('telemetry');
      const hasAccessibility =
        prepchefContent.includes('role="alert"') &&
        prepchefContent.includes('aria-live') &&
        displayContent.includes('role="alert"') &&
        displayContent.includes('aria-live');
      const hasStyling =
        prepchefContent.includes('bg-amber-100') &&
        prepchefContent.includes('bg-gray-100') &&
        displayContent.includes('bg-amber-100') &&
        displayContent.includes('bg-gray-100');

      if (!hasTelemetry) {
        return { passed: false, message: 'Banners missing telemetry support' };
      }

      if (!hasAccessibility) {
        return { passed: false, message: 'Banners missing accessibility attributes' };
      }

      if (!hasStyling) {
        return { passed: false, message: 'Banners missing proper styling' };
      }

      return {
        passed: true,
        message: 'UI banners accessible with telemetry and proper styling',
      };
    } catch (error) {
      return { passed: false, message: `Error verifying UI banners: ${error.message}` };
    }
  }

  async verifyDocsLinkTickets() {
    try {
      const reportPath = path.join(__dirname, '../../docs/operations/resilience_report.md');
      if (!fs.existsSync(reportPath)) {
        return { passed: false, message: 'Resilience report not found' };
      }

      const reportContent = fs.readFileSync(reportPath, 'utf8');

      // Check for ticket references
      const hasTicketSection =
        reportContent.includes('## Follow-up Tickets') ||
        reportContent.includes('Follow-up Tickets');

      const hasTicketLinks =
        reportContent.includes('[RES-001]') ||
        reportContent.includes('github.com/sst/opencode/issues');

      const hasTechnicalReferences =
        reportContent.includes('## Technical References') &&
        reportContent.includes('Chaos Helper') &&
        reportContent.includes('Drill Tests');

      if (!hasTicketSection) {
        return { passed: false, message: 'No follow-up tickets section in documentation' };
      }

      if (!hasTicketLinks) {
        return { passed: false, message: 'No ticket links in documentation' };
      }

      if (!hasTechnicalReferences) {
        return { passed: false, message: 'No technical references in documentation' };
      }

      return {
        passed: true,
        message: 'Documentation includes ticket links and technical references',
      };
    } catch (error) {
      return { passed: false, message: `Error verifying documentation: ${error.message}` };
    }
  }

  async generateVerificationReport() {
    const reportPath = path.join(__dirname, '../resilience-verification-results.json');
    const reportData = {
      timestamp: new Date().toISOString(),
      acceptanceCriteria: this.acceptanceCriteria,
      verificationResults: this.verificationResults,
      summary: this.generateSummary(),
    };

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Verification report generated: ${reportPath}`);
  }

  generateSummary() {
    const passed = this.acceptanceCriteria.filter((c) => c.verified).length;
    const total = this.acceptanceCriteria.length;
    const required = this.acceptanceCriteria.filter((c) => c.required).length;
    const requiredPassed = this.acceptanceCriteria.filter((c) => c.required && c.verified).length;

    return {
      totalCriteria: total,
      passedCriteria: passed,
      failedCriteria: total - passed,
      requiredCriteria: required,
      requiredPassed: requiredPassed,
      overallPassed: requiredPassed === required,
      passRate: ((passed / total) * 100).toFixed(1) + '%',
    };
  }

  printSummary() {
    const summary = this.generateSummary();

    console.log('📊 Verification Summary');
    console.log('=======================');
    console.log(`Total Criteria: ${summary.totalCriteria}`);
    console.log(`Passed: ${summary.passedCriteria}`);
    console.log(`Failed: ${summary.failedCriteria}`);
    console.log(`Required: ${summary.requiredCriteria}`);
    console.log(`Required Passed: ${summary.requiredPassed}`);
    console.log(`Pass Rate: ${summary.passRate}`);
    console.log(`Overall Status: ${summary.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);

    if (summary.overallPassed) {
      console.log('');
      console.log('🎉 All acceptance criteria have been met!');
    } else {
      console.log('');
      console.log(
        '⚠️  Some acceptance criteria have not been met. Please review the failures above.',
      );
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const verification = new ResilienceDrillVerification();
  verification.runVerification().catch(console.error);
}

module.exports = ResilienceDrillVerification;
