#!/usr/bin/env python3
# ============================================================================
# Security Report Generator - Generate Combined Security Report
# ============================================================================

# parking-management-system/scripts/generate-security-report.py

import json
import os
import sys
from datetime import datetime
from pathlib import Path
import html

def generate_html_report(results_dir):
    """Generate HTML security report from all scan results"""
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Security Scan Report</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 20px;
                background-color: #f5f5f5;
                color: #333;
            }
            .container {
                max-width: 1400px;
                margin: 0 auto;
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
            }
            .header p {
                margin: 5px 0 0 0;
                opacity: 0.9;
            }
            .section {
                margin-bottom: 30px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
            }
            .section-header {
                background-color: #f8f9fa;
                padding: 15px 20px;
                border-bottom: 1px solid #e0e0e0;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .section-header h2 {
                margin: 0;
                font-size: 20px;
            }
            .section-content {
                padding: 20px;
            }
            .status-badge {
                display: inline-block;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                color: white;
            }
            .status-passed {
                background-color: #28a745;
            }
            .status-failed {
                background-color: #dc3545;
            }
            .status-warning {
                background-color: #ffc107;
                color: #333;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
            }
            th {
                background-color: #f8f9fa;
                font-weight: 600;
            }
            tr:hover {
                background-color: #f8f9fa;
            }
            .severity-critical {
                color: #dc3545;
                font-weight: 600;
            }
            .severity-high {
                color: #fd7e14;
                font-weight: 600;
            }
            .severity-medium {
                color: #ffc107;
                font-weight: 600;
            }
            .severity-low {
                color: #28a745;
                font-weight: 600;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .summary-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                border-left: 4px solid #667eea;
            }
            .summary-card .number {
                font-size: 32px;
                font-weight: 700;
                color: #333;
            }
            .summary-card .label {
                font-size: 14px;
                color: #666;
                margin-top: 5px;
            }
            .timestamp {
                color: #666;
                font-size: 14px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Security Scan Report</h1>
                <p>Generated: """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """</p>
                <p>Repository: """ + os.getenv('GITHUB_REPOSITORY', 'Unknown') + """</p>
            </div>
    """
    
    # Parse scan results
    scan_results = parse_scan_results(results_dir)
    
    # Add summary cards
    html_content += generate_summary_cards(scan_results)
    
    # Add detailed results
    for scan_type, results in scan_results.items():
        html_content += generate_section(scan_type, results)
    
    html_content += """
            <div class="timestamp">
                Report generated by GitHub Actions Security Scan
            </div>
        </div>
    </body>
    </html>
    """
    
    return html_content

def parse_scan_results(results_dir):
    """Parse all scan result files"""
    results = {}
    results_dir = Path(results_dir)
    
    for file_path in results_dir.glob('**/*.json'):
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                results[file_path.stem] = data
        except Exception as e:
            print(f"Error parsing {file_path}: {e}")
    
    return results

def generate_summary_cards(results):
    """Generate summary statistics cards"""
    total_issues = 0
    critical_count = 0
    high_count = 0
    medium_count = 0
    low_count = 0
    
    # Count issues
    for scan_type, data in results.items():
        if isinstance(data, dict):
            if 'results' in data:
                for result in data['results']:
                    total_issues += 1
                    severity = result.get('severity', '').lower()
                    if severity == 'critical':
                        critical_count += 1
                    elif severity == 'high':
                        high_count += 1
                    elif severity == 'medium':
                        medium_count += 1
                    elif severity == 'low':
                        low_count += 1
    
    return f"""
    <div class="summary-grid">
        <div class="summary-card">
            <div class="number">{total_issues}</div>
            <div class="label">Total Issues</div>
        </div>
        <div class="summary-card">
            <div class="number">{critical_count}</div>
            <div class="label">Critical</div>
        </div>
        <div class="summary-card">
            <div class="number">{high_count}</div>
            <div class="label">High</div>
        </div>
        <div class="summary-card">
            <div class="number">{medium_count}</div>
            <div class="label">Medium</div>
        </div>
        <div class="summary-card">
            <div class="number">{low_count}</div>
            <div class="label">Low</div>
        </div>
    </div>
    """

def generate_section(scan_type, data):
    """Generate HTML section for a scan type"""
    html = f"""
    <div class="section">
        <div class="section-header">
            <h2>{scan_type.replace('-', ' ').title()}</h2>
            <span class="status-badge status-passed">Completed</span>
        </div>
        <div class="section-content">
    """
    
    if isinstance(data, dict):
        if 'results' in data and data['results']:
            html += """
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Severity</th>
                        <th>File</th>
                        <th>Line</th>
                    </tr>
                </thead>
                <tbody>
            """
            for result in data['results'][:50]:  # Limit to 50 results
                severity = result.get('severity', '').lower()
                severity_class = f"severity-{severity}" if severity in ['critical', 'high', 'medium', 'low'] else ''
                html += f"""
                    <tr>
                        <td>{html.escape(str(result.get('id', '')))}</td>
                        <td>{html.escape(str(result.get('title', '')))}</td>
                        <td class="{severity_class}">{html.escape(str(severity).upper())}</td>
                        <td>{html.escape(str(result.get('file', '')))}</td>
                        <td>{html.escape(str(result.get('line', '')))}</td>
                    </tr>
                """
            html += "</tbody></table>"
            
            if len(data['results']) > 50:
                html += f"<p><em>Showing 50 of {len(data['results'])} results</em></p>"
        else:
            html += "<p>No issues found.</p>"
    else:
        html += f"<pre>{html.escape(json.dumps(data, indent=2))}</pre>"
    
    html += """
        </div>
    </div>
    """
    
    return html

def main():
    results_dir = sys.argv[1] if len(sys.argv) > 1 else './reports'
    output_file = 'security-report.html'
    
    html_content = generate_html_report(results_dir)
    
    with open(output_file, 'w') as f:
        f.write(html_content)
    
    print(f"✅ Security report generated: {output_file}")

if __name__ == '__main__':
    main()