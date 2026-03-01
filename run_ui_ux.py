import sys
import os

skill_path = r"C:\Users\manav\.gemini\antigravity\skills\ui-ux-pro-max\scripts"
sys.path.insert(0, skill_path)

try:
    from design_system import generate_design_system
    result = generate_design_system("ecommerce luxury premium elegant", "Ecom Shrihari", "markdown")
    with open(r"d:\Manav\website\ecomshrihari\design_system.md", "w", encoding="utf-8") as f:
        f.write(result)
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
