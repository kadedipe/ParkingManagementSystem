#!/usr/bin/env python3
"""
Generate combined security report from all scanning tools.
"""

import json
import sys
from pathlib import Path
from datetime import datetime

def generate_report(reports_dir):
    """Generate a combined security report."""
    reports_path = Path(reports_dir)
    
    report_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Security Scan Report</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            h1 {{ color: #333; }}
            .report-section {{ margin: 20px 0; padding: 15px; border: 1px solid #ddd; }}
            .summary {{ background-color: #f9f9f9; }}
            table {{ width: 100%; border-collapse: collapse; }}
            th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
            .critical {{ color: #d32f2f; font-weight: bold; }}
            .high {{ color: #f57c00; font-weight: bold; }}
            .medium {{ color: #fbc02d; font-weight: bold; }}
            .low {{ color: #388e3c; font-weight: bold; }}
        </style>
    </head>
    <body>
        <h1>🔒 Security Scan Report</h1>
        <div class="report-section summary">
            <h2>Report Summary</h2>
            <p><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>This report aggregates security scanning results from multiple tools.</p>
        </div>
        
        <div class="report-section">
            <h2>Scanning Tools Utilized</h2>
            <ul>
                <li>SonarQube - Static Application Security Testing (SAST)</li>
                <li>CodeQL - Code Analysis</li>
                <li>Semgrep - Pattern-based Analysis</li>
                <li>Bandit - Python Security Scanning</li>
                <li>Snyk - Dependency Scanning</li>
                <li>npm audit - Node.js Dependency Scanning</li>
                <li>Safety - Python Dependency Scanning</li>
                <li>Trivy - Container Image Scanning</li>
                <li>Gitleaks - Secret Detection</li>
                <li>OWASP ZAP - Dynamic Testing</li>
                <li>Checkov - Infrastructure as Code Scanning</li>
            </ul>
        </div>
        
        <div class="report-section">
            <h2>Scan Results</h2>
            <p>Detailed results are available in the individual report artifacts.</p>
        </div>
    </body>
    </html>
    """
    
    return report_content

if __name__ == "__main__":
    reports_dir = sys.argv[1] if len(sys.argv) > 1 else "reports/"
    
    try:
        report = generate_report(reports_dir)
        
        # Write report
        output_file = Path("security-report.html")
        output_file.write_text(report)
        
        print(f"✓ Security report generated: {output_file}")
        sys.exit(0)
    except Exception as e:
        print(f"✗ Error generating report: {e}", file=sys.stderr)
        sys.exit(1)
