# ============================================================================
# HTML Report Generator - Load Test Results Visualization
# ============================================================================

# parking-management-system/tests/load/generate-report.py

import json
import sys
from datetime import datetime

def generate_html_report(json_file, html_file):
    """Generate HTML report from K6 JSON results"""
    
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Load Test Report</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 20px;
                background-color: #f5f5f5;
            }}
            .container {{
                max-width: 1200px;
                margin: 0 auto;
                background-color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #333;
                border-bottom: 2px solid #007AFF;
                padding-bottom: 10px;
            }}
            .summary {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }}
            .metric-card {{
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #007AFF;
            }}
            .metric-value {{
                font-size: 24px;
                font-weight: bold;
                color: #333;
            }}
            .metric-label {{
                color: #666;
                font-size: 14px;
            }}
            .threshold-pass {{
                color: #34C759;
                font-weight: bold;
            }}
            .threshold-fail {{
                color: #FF3B30;
                font-weight: bold;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }}
            th, td {{
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }}
            th {{
                background-color: #f2f2f2;
                font-weight: bold;
            }}
            .status-ok {{
                color: #34C759;
            }}
            .status-fail {{
                color: #FF3B30;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Load Test Report</h1>
            <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            
            <div class="summary">
                <div class="metric-card">
                    <div class="metric-label">Total Requests</div>
                    <div class="metric-value">{data['metrics']['http_reqs']['values']['count']}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Request Rate</div>
                    <div class="metric-value">{data['metrics']['http_reqs']['values']['rate']:.2f}/s</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Avg Response Time</div>
                    <div class="metric-value">{data['metrics']['http_req_duration']['values']['avg']:.2f}ms</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Error Rate</div>
                    <div class="metric-value">{data['metrics']['http_req_failed']['values']['rate']*100:.2f}%</div>
                </div>
            </div>
            
            <h2>📊 Response Time Percentiles</h2>
            <table>
                <tr>
                    <th>Percentile</th>
                    <th>Value</th>
                    <th>Status</th>
                </tr>
                <tr>
                    <td>95th Percentile</td>
                    <td>{data['metrics']['http_req_duration']['values']['p(95)']:.2f}ms</td>
                    <td class="{ 'status-ok' if data['metrics']['http_req_duration']['values']['p(95)'] < 500 else 'status-fail' }">
                        { '✅ PASS' if data['metrics']['http_req_duration']['values']['p(95)'] < 500 else '❌ FAIL' }
                    </td>
                </tr>
                <tr>
                    <td>99th Percentile</td>
                    <td>{data['metrics']['http_req_duration']['values']['p(99)']:.2f}ms</td>
                    <td class="{ 'status-ok' if data['metrics']['http_req_duration']['values']['p(99)'] < 1000 else 'status-fail' }">
                        { '✅ PASS' if data['metrics']['http_req_duration']['values']['p(99)'] < 1000 else '❌ FAIL' }
                    </td>
                </tr>
            </table>
            
            <h2>📋 Request Summary</h2>
            <table>
                <tr>
                    <th>Endpoint</th>
                    <th>Requests</th>
                    <th>Avg (ms)</th>
                    <th>Min (ms)</th>
                    <th>Max (ms)</th>
                    <th>P95 (ms)</th>
                </tr>
    """
    
    # Add endpoint-specific metrics
    for endpoint, metrics in data['metrics'].items():
        if endpoint.startswith('http_req_duration{') and 'expected_response' in endpoint:
            name = endpoint.split('name:')[1].split(',')[0] if 'name:' in endpoint else 'unknown'
            html += f"""
                <tr>
                    <td>{name}</td>
                    <td>{metrics['values']['count']}</td>
                    <td>{metrics['values']['avg']:.2f}</td>
                    <td>{metrics['values']['min']:.2f}</td>
                    <td>{metrics['values']['max']:.2f}</td>
                    <td>{metrics['values']['p(95)']:.2f}</td>
                </tr>
            """
    
    html += """
            </table>
            
            <h2>📈 Performance Thresholds</h2>
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Threshold</th>
                    <th>Actual</th>
                    <th>Status</th>
                </tr>
                <tr>
                    <td>HTTP Duration (P95)</td>
                    <td>&lt; 500ms</td>
                    <td>{:.2f}ms</td>
                    <td class="{}">{}</td>
                </tr>
                <tr>
                    <td>HTTP Error Rate</td>
                    <td>&lt; 1%</td>
                    <td>{:.2f}%</td>
                    <td class="{}">{}</td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    """.format(
        data['metrics']['http_req_duration']['values']['p(95)'],
        'status-ok' if data['metrics']['http_req_duration']['values']['p(95)'] < 500 else 'status-fail',
        '✅ PASS' if data['metrics']['http_req_duration']['values']['p(95)'] < 500 else '❌ FAIL',
        data['metrics']['http_req_failed']['values']['rate']*100,
        'status-ok' if data['metrics']['http_req_failed']['values']['rate'] < 0.01 else 'status-fail',
        '✅ PASS' if data['metrics']['http_req_failed']['values']['rate'] < 0.01 else '❌ FAIL'
    )
    
    with open(html_file, 'w') as f:
        f.write(html)
    
    print(f"✅ HTML report generated: {html_file}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate-report.py <json_file> <html_file>")
        sys.exit(1)
    
    generate_html_report(sys.argv[1], sys.argv[2])