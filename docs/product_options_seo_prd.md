# Product Requirements Document (PRD)
## Product Options, Attributes, SEO and Product Content

**Project:** EcomShriHari  
**Date:** March 29, 2026  
**Owner:** Product + Engineering  
**Status:** Draft v1

---

## Index
1) Purpose and Scope  
2) What We Are Implementing  
3) Why This Is Needed  
4) Functional Requirements  
5) Data Model (Proposed)  
6) Admin UX Requirements  
7) Storefront UX Requirements  
8) Business Rules  
9) Acceptance Criteria

---

## 1) Purpose and Scope
This PRD defines the product options, attributes, and SEO/content features that we will implement now. It excludes GST and any option-based price changes. The goal is to make most common product types configurable without custom code.

---

## 2) What We Are Implementing
- Product options with these input types: radio, multi-select (checkbox), dropdown, input field.
- Basic option validation rules that work for most product types.
- Product attributes (specifications) that can be reused across products.
- SEO metadata fields for product pages.
- Product content fields for marketing and conversion.
- Order item snapshot of selected options.

---

## 3) Why This Is Needed
- **Options:** Different product types need different selectors (size, pack, custom text). A flexible option system avoids custom development for each catalog.
- **Attributes:** Specs like GSM, brand, and weave improve clarity, reduce returns, and enable filtering later.
- **SEO/Content:** Rich product content and correct meta tags improve search ranking and conversion.

---

## 4) Functional Requirements

### 4.1 Product Options
- Admin can create option groups per product.
- Supported option input types:
  - Radio (single select)
  - Multi-select (checkbox)
  - Dropdown (single select)
  - Input field (text or number)
- Option values are required for radio, multi-select, and dropdown.
- Input fields support:
  - Text or number type
  - Placeholder and helper text
  - Required flag
  - Min and max length for text
  - Min and max value for number
- Multi-select supports optional min and max selections.
- Required options must be completed before add to cart.
- Selected options are stored on the order item.
- No price changes based on options in this phase.

### 4.2 Product Attributes
- Admin can define global attribute definitions (name, type, unit, allowed values).
- Attributes can be attached to products and displayed as specs.
- Supported attribute data types:
  - Text, number, boolean, single select, multi select

### 4.3 SEO and Product Content
- SEO fields per product:
  - Meta title, meta description, canonical URL
  - OG title, OG description, OG image URL
  - Twitter card type
- Content fields per product:
  - Short description
  - Long description (rich text)
  - Highlights list
  - Care instructions
  - FAQ list
- SEO metadata must render in product page head.

---

## 5) Data Model (Proposed)

### 5.1 Options
- `product_option_groups`
  - id, product_id, name, input_type, required, sort_order, is_active
  - input_data_type, placeholder, help_text
  - min_selections, max_selections
  - input_min_length, input_max_length
  - input_min_value, input_max_value
- `product_option_values`
  - id, group_id, label, value, is_default, sort_order, is_active

### 5.2 Attributes
- `product_attribute_definitions`
  - id, name, slug, data_type, allowed_values_json, unit, is_filterable
- `product_attribute_values`
  - id, product_id, attribute_id, value_text, value_number, value_bool, value_json

### 5.3 SEO and Content Fields
- Add to `products`:
  - meta_title, meta_description, canonical_url
  - og_title, og_description, og_image_url, twitter_card_type
  - short_description, long_description, highlights_json, care_instructions, faqs_json

### 5.4 Order Snapshot
- Add to `order_items`:
  - selected_options_json (option name, value, input, display label)

---

## 6) Admin UX Requirements
- Product edit page has tabs: Options, Attributes, SEO, Content.
- Options tab:
  - Create option group, select input type, set required.
  - Add values for radio, multi-select, dropdown.
  - Configure input placeholders and helper text.
  - Configure min/max selection and input validation rules.
- Attributes tab:
  - Select existing attribute definitions.
  - Create new attribute definitions without leaving the product screen.
- SEO tab:
  - Fields with character count hints for title and description.
- Content tab:
  - Rich text editor and structured blocks (highlights, care, FAQs).

---

## 7) Storefront UX Requirements
- Product page renders option selectors based on input type.
- Required options are validated before add to cart.
- Input fields show clear validation messages when required or invalid.
- Multi-select respects min and max selection rules when set.
- Selected options are shown in cart and order summary.
- Attributes display in a specs section.
- SEO metadata renders in head tags.
- Content blocks render consistently across themes.

---

## 8) Business Rules
- Options do not change price in this phase.
- Options are configured at the product level.
- Selected options are stored as a snapshot on order items.
- Removing an option group does not change past orders.
- Input validation rules must block add to cart when invalid.

---

## 9) Acceptance Criteria
1. Admin can create option groups for radio, multi-select, dropdown, and input field.
2. Storefront blocks add to cart when required options are missing.
3. Admin can define attributes and attach them to products.
4. Product page displays attributes and content blocks correctly.
5. Selected options are saved on order items.
6. Product SEO metadata renders in page head.
7. Input and selection validation rules are enforced on add to cart.
