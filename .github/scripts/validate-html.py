#!/usr/bin/env python3
"""
Simple HTML validation script for CI
"""
import sys
import os
import glob

def validate_html_file(filepath):
    """Basic HTML validation - check for common syntax issues"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Basic validation checks
        if '<html' in content and '</html>' not in content:
            print(f'ERROR: Missing closing </html> tag in {filepath}')
            return False
            
        if '<head' in content and '</head>' not in content:
            print(f'ERROR: Missing closing </head> tag in {filepath}')
            return False
            
        if '<body' in content and '</body>' not in content:
            print(f'ERROR: Missing closing </body> tag in {filepath}')
            return False
            
        print(f'✓ {filepath} syntax OK')
        return True
        
    except Exception as e:
        print(f'ERROR: Failed to validate {filepath}: {e}')
        return False

def main():
    """Validate all HTML files in the current directory"""
    html_files = glob.glob('*.html')
    
    if not html_files:
        print('No HTML files found to validate')
        return True
        
    print(f'Validating {len(html_files)} HTML file(s)...')
    
    all_valid = True
    for html_file in html_files:
        if not validate_html_file(html_file):
            all_valid = False
    
    return all_valid

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)