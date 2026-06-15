export type Task = {
    title: string;
    steps: string[];
};

export type Section = {
    id: string;
    title: string;
    subtitle: string;
    routeHints: string[];
    whatThisDoes: string[];
    tasks: Task[];
    howItWorks: string[];
    tips: string[];
};

export type DocMode = "handbook" | "technical";

const HANDBOOK_SECTIONS: Section[] = [
    {
        id: "dashboard",
        title: "Dashboard Overview",
        subtitle: "Monitor real-time sales activity, processing volumes, customer registrations, and inventory alerts.",
        routeHints: ["/admin"],
        whatThisDoes: [
            "Displays a high-level performance snapshot: Total Sales (INR value of paid orders), Active Orders (orders in pending, processing, or shipped states), Total catalog Products, and Total registered Customer Profiles.",
            "Surfaces a prioritized operations table listing the 8 most recent orders with quick access to invoice and status updates.",
            "Generates warnings in the Low Stock Alerts panel for up to 10 product variants whose remaining inventory is under 20 units.",
            "Executes automated database check routines and displays warning panels if Row Level Security (RLS) is disabled for any core tables."
        ],
        tasks: [
            {
                title: "Daily Store Operations & Prioritization Workflow",
                steps: [
                    "Sign in to the Admin Panel and access the main Dashboard page at `/admin`.",
                    "Review the **Active Orders** summary card to see the packaging queue volume for the day.",
                    "Verify the **Total Sales** overview and evaluate customer acquisition trend metrics.",
                    "Scroll down to the **Recent Orders** list and click any customer's name to view their complete profile and purchase history.",
                    "Analyze the **Low Stock Alerts** table to determine which fabric options or color variants are running low (under 20 remaining). Click 'Restock' on any low item to jump directly to the stock replenishment form.",
                    "Check the bottom warning section to verify database health. If the 'RLS Warning' banner appears indicating disabled table security, immediately notify the technical administrator.",
                    "[Screenshot Placeholder: Admin Dashboard Overview - Recent Orders & Low Stock Tables]"
                ]
            }
        ],
        howItWorks: [
            "Directly queries database counts and aggregates inside server-side actions.",
            "Executes parallel database counts on products and profiles to minimize page loading times.",
            "Fires stock alert flags when individual variant stock levels drop below the threshold limit.",
            "Queries the Supabase RPC routine 'get_disabled_rls_tables' to list tables that lack RLS protection."
        ],
        tips: [
            "Check the Low Stock Alerts panel first thing in the morning to prevent stockouts on popular fabric categories.",
            "Admin statistics only count orders with 'paid' payment status to reflect actual cleared revenue, while charts include all non-cancelled orders.",
            "Make sure variant SKUs are properly configured so low stock alerts link to the correct catalog item."
        ]
    },
    {
        id: "products",
        title: "Products & Catalog",
        subtitle: "Create catalog items, define variant pricing, upload photos, curate reviews, and configure the Fabric Calculator.",
        routeHints: ["/admin/products", "/admin/products/categories", "/admin/products/stock", "/admin/products/reviews"],
        whatThisDoes: [
            "Stores the core product catalog details including titles, care notes, featured flags, and selling modes (meters vs pieces).",
            "Manages distinct color variants with SKU codes, price adjustments, original prices (for discount tags), and inventory stock limits for multiple variants per product.",
            "Powers the storefront **Fabric Calculator** modal that helps customers estimate fabric needs based on clothing types, standard sizes, and width presets.",
            "Provides review curation controls to manage visibility settings, create curated reviews, and upload customer photo/video assets."
        ],
        tasks: [
            {
                title: "Creating a Fabric Product with Color Variants",
                steps: [
                    "Navigate to the Products sidebar menu and click **Create New Product**.",
                    "Fill in the Title, Category, slug, description, and select the selling mode: **Meters**.",
                    "Scroll down to the **Color Variants** card and click **Add Variant**.",
                    "Enter the color name, click the **Color Swatch** picker to define the hex color circle displayed on the storefront, and set the SKU, Selling Price, and initial Stock.",
                    "Set the **Original Price** to a value higher than the Selling Price to display an automatic discount tag on the storefront.",
                    "Upload variant photos directly into the variant image manager, choose the primary photo, and save changes.",
                    "[Screenshot Placeholder: Admin Product Creator - Color Variant Hex Swatch Picker & Media Uploader]"
                ]
            },
            {
                title: "Managing Customer Review Visibility and Curation",
                steps: [
                    "Go to the Reviews moderation queue at `/admin/products/reviews`.",
                    "Identify reviews and click the **Visibility Switch** to approve or hide them from the product details page (PDP).",
                    "To curate a new review, click **Add Review**, search and select the target product, enter a customer name, select the star rating (1 to 5), and input the comment text.",
                    "Upload review images or videos to showcase customer satisfaction, then click Save.",
                    "[Screenshot Placeholder: Reviews Moderation Queue - Curated Review Creation Dialog]"
                ]
            }
        ],
        howItWorks: [
            "Stores details in 'products', 'product_variants', 'variant_images', 'product_option_groups', and 'product_option_values' tables.",
            "Theme-level customizations are resolved by custom Webpack compiler settings that check the 'src/themes/changes/' folder before loading default layouts.",
            "Fabric Calculator uses base preset lengths (e.g. Salwar Suit = 2.5m) and multiplies them by size modifiers (e.g. XL = 1.2x) and width modifiers (e.g. Narrow 36\" = 1.25x).",
            "Estimates are rounded up to the nearest 0.5-meter interval to ensure customers buy sufficient fabric lengths: `Math.max(0.5, Math.ceil(rawMeters * 2) / 2)`."
        ],
        tips: [
            "Double-check your color variant hex codes so storefront circles accurately match fabric shades.",
            "All product and review media uploads are saved in public storage buckets ('product-images' and 'blog-media'). Make sure file sizes are under 1MB to optimize performance."
        ]
    },
    {
        id: "orders",
        title: "Orders & Fulfillment",
        subtitle: "Review customer checkouts, update status transitions, enter courier tracking, and download PDF invoices.",
        routeHints: ["/admin/orders", "/admin/orders/[id]", "/admin/orders/[id]/print"],
        whatThisDoes: [
            "Aggregates customer checkout transactions including totals, coupon codes, notes, and payment statuses.",
            "Controls order status transitions from Pending to Confirmed to Processing to Ready to Ship to Shipped to Delivered.",
            "Logs detailed order status history records for admin auditing.",
            "Generates print-ready PDF invoices on the fly using a custom, high-fidelity A4 layout compiler."
        ],
        tasks: [
            {
                title: "Processing and Shipping a Customer Order",
                steps: [
                    "Go to the Orders list page and locate a new **Pending** order.",
                    "Click the order row to open the complete details screen.",
                    "Inspect the order items, delivery address, and notes.",
                    "Click the status dropdown, update the order status to **Processing**, and prepare the physical package.",
                    "Once packaged, select the status **Shipped**, enter the courier service tracking link, and save details.",
                    "Click **Download Invoice** to save and print the PDF invoice. Place this invoice inside the shipping box.",
                    "[Screenshot Placeholder: Order Details - Status Transition Dropdown and Download Invoice Button]"
                ]
            }
        ],
        howItWorks: [
            "Links records across 'public.orders', 'public.order_items', 'public.order_addresses', and 'public.order_status_history'.",
            "Order status validation uses customizable values stored in the 'order_custom_statuses' table.",
            "The invoice PDF is built on-demand using jsPDF, mapping brand colors (#9f3f29 terracotta, #faf8f5 beige) and drawing transaction blocks.",
            "Invoice text is wrapped dynamically using 'doc.splitTextToSize' and layout coordinates adjust for variable heights."
        ],
        tips: [
            "Always enter the complete courier tracking URL (including 'https://') so customers can click it directly in their shipment notification emails.",
            "Verify payment confirmation matches details in your Razorpay dashboard before changing status to Shipped."
        ]
    },
    {
        id: "customers",
        title: "Customers & Accounts",
        subtitle: "Review shopper history, track lifetime value, edit default addresses, and handle soft account deletion.",
        routeHints: ["/admin/customers", "/admin/customers/[id]"],
        whatThisDoes: [
            "Maintains shopper profiles with order frequencies, lifetime value (LTV) summaries, and contact details.",
            "Logs customer timeline interactions to track account milestones.",
            "Supports adding internal administrative notes to profiles for customer service records.",
            "Provides an automated, GDPR-compliant soft account deletion engine that scrubs PII while preserving accounting records."
        ],
        tasks: [
            {
                title: "Reviewing Lifetime Value and Customer Notes",
                steps: [
                    "Open the Customers directory and search for a customer name or email.",
                    "Click the profile to view order history, total spent, and registered shipping addresses.",
                    "Scroll to the **Internal Notes** box, type any customer service summaries, and click Save Note.",
                    "[Screenshot Placeholder: Customer Directory - Lifetime Value Dashboard and Search Filters]"
                ]
            },
            {
                title: "Executing a GDPR/Privacy Soft-Deletion Request",
                steps: [
                    "Locate the customer's profile details screen.",
                    "Confirm the deletion request and click **Soft Delete Account**.",
                    "Verify that their name updates to 'Deleted User', email is scrubbed, addresses are deactivated, and login is disabled.",
                    "[Screenshot Placeholder: Customer Detail Page - Privacy Actions and Anonymize Dialog]"
                ]
            }
        ],
        howItWorks: [
            "Customer directories query the aggregated database view 'admin_customer_summary' to load metrics efficiently.",
            "Deactivated addresses are marked as 'is_deleted = true' to prevent database constraint failures on historical order rows.",
            "Soft-deletion overrides values in 'user_profiles' and updates Supabase Auth users using auth admin keys, deactivating login credentials."
        ],
        tips: [
            "Always use soft deletion instead of database hard deletion to keep accounting reports accurate.",
            "Ensure the database check constraint on 'user_profiles.account_status' contains the 'deleted' status to prevent query failures."
        ]
    },
    {
        id: "coupons",
        title: "Coupons & Discounts",
        subtitle: "Launch promotion campaigns, set cart eligibility limits, and restrict codes to selected users.",
        routeHints: ["/admin/coupons", "/admin/coupons/new", "/admin/coupons/[id]"],
        whatThisDoes: [
            "Generates promotional codes supporting flat discount values or percentage-based deductions.",
            "Configures minimum purchase subtotal limits, maximum caps, validity dates, and usage limits.",
            "Restricts specific coupons to a custom list of registered customer accounts.",
            "Tracks redemption counts, discounts applied, and overall influenced sales revenue."
        ],
        tasks: [
            {
                title: "Creating a VIP Customer Coupon",
                steps: [
                    "Go to the Coupons section and click **Create Coupon**.",
                    "Enter a code (e.g., VIP20), name, and set the type to **Percentage** with a value of 20.",
                    "Define a minimum purchase subtotal (e.g., ₹2000) and a maximum discount cap (e.g., ₹500).",
                    "Toggle the **User Specific** switch to active.",
                    "Search and select the customer profiles that are allowed to redeem this coupon.",
                    "Click Save to launch the campaign.",
                    "[Screenshot Placeholder: Coupon Creator - User-Targeted Account Lookup]"
                ]
            }
        ],
        howItWorks: [
            "Stores details in 'public.coupons', 'public.coupon_user_assignments', and 'public.coupon_redemptions'.",
            "Redemptions use a Postgres database function 'public.redeem_coupon_atomic' with lock control to prevent race conditions during sales.",
            "Validator logic checks code constraints, validity dates, and user IDs during checkout processes."
        ],
        tips: [
            "Create coupon codes in uppercase characters (e.g., SUMMER10) to make them easier for users to type.",
            "Use the maximum completed orders constraint set to 0 to target first-time buyers only."
        ]
    },
    {
        id: "content-management",
        title: "Content Management (CMS)",
        subtitle: "Manage hero slideshows, popup banners, category display sorting, and schedule blog articles.",
        routeHints: ["/admin/blog", "/admin/notifications-templates", "/admin/cms"],
        whatThisDoes: [
            "Controls storefront slideshows, popup announcement blocks, and notification bars.",
            "Sets category sort sequences and display filters.",
            "Provides a visual blog editor supporting tag classifications, related product lists, and draft revisions.",
            "Implements a scheduled publishing validation routine that runs cover photo checks, safety checks, and image alt text checks."
        ],
        tasks: [
            {
                title: "Updating Homepage Slide Priority & Placements",
                steps: [
                    "Go to CMS -> Banners and choose the Homepage Hero section.",
                    "Upload slide images (ensure file sizes are under 300KB for performance).",
                    "Define redirect URLs and enter **Priority Numbers** (higher values show first in the slide order).",
                    "Click Save Changes to push updates to the storefront.",
                    "[Screenshot Placeholder: CMS Banners - Priority Ordering and Upload Panel]"
                ]
            },
            {
                title: "Scheduling a Blog Post with Alt Text",
                steps: [
                    "Go to CMS -> Blog and click **Create Post**.",
                    "Write content sections and upload a cover photo.",
                    "Add descriptive text in the **SEO Image Alt Text** field to support search engine indexing.",
                    "Set the status dropdown to **Scheduled** and pick a future publish date and time.",
                    "Click Save. The scheduler will publish the article automatically at the target time.",
                    "[Screenshot Placeholder: CMS Blog Editor - Schedule Timestamp and Alt Text Requirement]"
                ]
            }
        ],
        howItWorks: [
            "CMS configs are stored in 'public.banners', 'public.blog_posts', 'public.blog_categories', and 'public.blog_slug_redirects'.",
            "Scheduled blog publishing runs via a POST webhook `/api/admin/blogs/scheduler` called by a background cron job.",
            "The validator checks that scheduled posts have titles, slugs, cover images, alt text, and approved custom code.",
            "Successfully saving cms categories or banners calls Next.js revalidate tag APIs to refresh cached static layouts."
        ],
        tips: [
            "Always include keyword-rich alt text on blog images to improve Google SEO ranking.",
            "Toggle the custom code acknowledgement button if your blog post contains custom HTML elements or scripts."
        ]
    },
    {
        id: "documentation",
        title: "Documentation & Search",
        subtitle: "Browse handbook guides, search tasks, and toggle developer debug modes.",
        routeHints: ["/admin/documentation"],
        whatThisDoes: [
            "Gathers operations manuals, step-by-step guides, and developer notes.",
            "Indexes guides and tasks for search terms.",
            "Highlights matching keywords inside search results templates.",
            "Exposes developer configurations and cache control utilities."
        ],
        tasks: [
            {
                title: "Searching Documentation and Enabling Developer Mode",
                steps: [
                    "Navigate to the **Documentation** section.",
                    "Type keywords (e.g. 'refund' or 'Shiprocket') in the search bar to locate guides.",
                    "Review matching tasks and tips with query words highlighted.",
                    "Toggle **Developer Mode** in the sidebar to view detailed database schemas and route files.",
                    "[Screenshot Placeholder: Admin Documentation - Search Highlight and Developer Toggle]"
                ]
            }
        ],
        howItWorks: [
            "Renders details dynamically using the structured static array defined in 'docsData.ts'.",
            "Keyword search escapes special characters and builds a dynamic regular expression to split matching texts.",
            "Splits are wrapped in HTML 'mark' tags to highlight matches in the UI.",
            "Saves developer mode preference in browser local storage."
        ],
        tips: [
            "Turn Developer Mode ON to see related database tables and code files for each admin section.",
            "Search queries are case-insensitive and match keywords inside tasks, descriptions, and tips."
        ]
    },
    {
        id: "reports",
        title: "Reports & Sales Analytics",
        subtitle: "Review revenue statistics, checkout volumes, payment channels, and download CSV reports.",
        routeHints: ["/admin/reports"],
        whatThisDoes: [
            "Aggregates sales metrics (Gross sales, returns/refunds, net sales, and average order value).",
            "Draws visualizations (Composed area/line charts, bar charts, donut charts).",
            "Provides date range presets (Today, Week, Month, Year, Custom).",
            "Formats and streams CSV spreadsheet downloads of transaction data."
        ],
        tasks: [
            {
                title: "Analyzing and Exporting Sales Reports",
                steps: [
                    "Open the Reports page at `/admin/reports`.",
                    "Select a report tab from the sidebar menu.",
                    "Set target date ranges using the calendar picker.",
                    "Click **Export CSV** to download the spreadsheet data.",
                    "[Screenshot Placeholder: Sales Reports - Date Preset Filter and CSV Export Trigger]"
                ]
            }
        ],
        howItWorks: [
            "Fetches orders and order items grouped by date ranges, categories, states, or payment channels.",
            "Composed charts show Area charts (Net Sales) and Line charts (Order counts) together.",
            "Donut charts are configured with inner and outer radii and padding angles to display category ratios.",
            "CSV exporter parses row values, escapes double quotes, wraps strings containing commas, and triggers browser downloads."
        ],
        tips: [
            "Filter reports to show paid and delivered statuses to review actual net profits, excluding unpaid and cancelled orders.",
            "Ensure order dates are indexed in the database to maintain fast report generation speeds."
        ]
    },
    {
        id: "payments",
        title: "Payments Gateways & COD",
        subtitle: "Configure online gateways, set COD fees, and verify signatures.",
        routeHints: ["/admin/payments"],
        whatThisDoes: [
            "Manages credentials for online payment gateways (Razorpay).",
            "Sets Cash on Delivery (COD) transaction fees.",
            "Supports partial advance payment rules for cash on delivery checkouts.",
            "Validates gateway webhooks using cryptographical signature checks."
        ],
        tasks: [
            {
                title: "Configuring Payment Gateways & COD Fees",
                steps: [
                    "Go to Payment Settings.",
                    "Enter the Razorpay Key ID and Key Secret.",
                    "Enable Cash on Delivery and define the COD fee (e.g. ₹50).",
                    "Click Save to push credentials to the secure settings table.",
                    "[Screenshot Placeholder: Payment Settings - API Credentials and COD Configuration]"
                ]
            }
        ],
        howItWorks: [
            "Webhook endpoint '/api/payments/razorpay/verify' checks signature parameters.",
            "Calculates expected signatures using 'crypto.createHmac('sha256', secret)' with order ID and payment ID.",
            "COD checkout handler '/api/checkout/place-order' calculates advance amounts and generates Razorpay sessions for partial payments."
        ],
        tips: [
            "Ensure that Razorpay webhook URLs are configured in your Razorpay dashboard.",
            "Review transaction signatures in the payments panel if you notice payment mismatches."
        ]
    },
    {
        id: "shipping",
        title: "Shipping & Fulfillment Providers",
        subtitle: "Select delivery partners, set flat rates, and configure COD partial payment criteria.",
        routeHints: ["/admin/shipping"],
        whatThisDoes: [
            "Integrates with Delhivery and Shiprocket delivery APIs.",
            "Enables grouping India's 36 states and UTs into custom delivery zones with flat charges.",
            "Configures free shipping threshold limits.",
            "Determines shipping totals dynamically at checkout."
        ],
        tasks: [
            {
                title: "Setting Up Custom State Groups and Fees",
                steps: [
                    "Open Shipping Settings.",
                    "Click **Add State Group**.",
                    "Provide a group name (e.g. South Zone) and enter a flat fee.",
                    "Check target states (previously allocated states will be disabled) and click Add Group.",
                    "Click Save at the bottom of the page.",
                    "[Screenshot Placeholder: Shipping Settings - State Allocation Map and Zone Config]"
                ]
            }
        ],
        howItWorks: [
            "State mappings are saved in 'site_settings.shipping_state_groups' JSONB: `[{ id: string, name: string, states: string[], charge: number }]`.",
            "Checkout calculator in 'src/lib/shipping/rates.ts' matches state groups case-insensitively.",
            "If discounted subtotal matches 'shipping_free_threshold', the shipping fee resolves to 0."
        ],
        tips: [
            "Ensure all states are mapped to prevent shipping fee calculations from falling back to default rates.",
            "Ensure Delhivery/Shiprocket API keys are masked with placeholders in settings views."
        ]
    },
    {
        id: "settings",
        title: "Settings & System Cache",
        subtitle: "Select storefront themes, configure custom order statuses, and manage system cache.",
        routeHints: ["/admin/settings"],
        whatThisDoes: [
            "Saves layout preferences, site contact information, and active themes.",
            "Manages custom order status records and label colors.",
            "Exposes manual cache bust buttons to purge page-level cached files."
        ],
        tasks: [
            {
                title: "Creating Custom Order Status Badges & Purging Cache",
                steps: [
                    "Go to **Settings** and locate **Custom Order Statuses**.",
                    "Click **Add Status**, enter a label name, choose a badge color, and save.",
                    "Scroll to cache settings and click **Clear Site Cache** to sync changes.",
                    "[Screenshot Placeholder: Settings Panel - Custom Status Registry and Cache Bust Trigger]"
                ]
            }
        ],
        howItWorks: [
            "Stores settings inside the 'public.site_settings' table.",
            "Manual cache clearing calls Next.js 'revalidateTag' for: 'products', 'cms_banners', 'cms_categories', 'site_config', and 'blog_posts'.",
            "Dev environments skip caching entirely."
        ],
        tips: [
            "Always clear the cache after changing custom statuses to update them in order lists.",
            "Select unique color badges for custom statuses to help staff scan order queues."
        ]
    }
];

const TECH_SECTIONS: Section[] = [
    {
        id: "dashboard",
        title: "Dashboard Architecture & Metrics",
        subtitle: "Database views, parallel query aggregation actions, and UI widgets binding.",
        routeHints: ["src/app/actions/dashboardStats.ts", "src/app/admin/page.tsx"],
        whatThisDoes: [
            "Uses Next.js server actions to run aggregate database count and summation calculations.",
            "Executes parallel queries on orders, products, and variants to decrease load times.",
            "Binds real data feeds to Recent Orders lists and Low Stock Alerts tables.",
            "Queries disabled RLS tables via Postgres RPC get_disabled_rls_tables."
        ],
        tasks: [
            {
                title: "Extend dashboard stats query",
                steps: [
                    "Open `src/app/actions/dashboardStats.ts`.",
                    "Add database query blocks to fetch new analytical metrics from Supabase.",
                    "Update the `DashboardMetricsResponse` interface to include the new fields.",
                    "Save and check the admin home screen to verify the new widgets bind without errors."
                ]
            }
        ],
        howItWorks: [
            "Count queries count rows: `const { count } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true })`.",
            "Low stock checks query product variants where stock < 20: `.select('id, color_name, stock, sku, products(name)').lt('stock', 20)`.",
            "Main admin page uses React hooks to fetch data on component mount, displaying loading animations until resolved."
        ],
        tips: [
            "Keep dashboard queries simple; avoid complex joins to maintain fast home screen rendering times."
        ]
    },
    {
        id: "products",
        title: "Products & Custom Overrides System",
        subtitle: "Supabase schema mappings, custom Webpack resolver, and Fabric Calculator formulas.",
        routeHints: ["src/themes/changes/", "src/components/FabricCalculator.tsx", "next.config.mjs"],
        whatThisDoes: [
            "Resolves imports to themes changes/ overrides folder at compilation time.",
            "Powers the Fabric Calculator preset ratios and sizing multipliers.",
            "Maintains variant SKUs, color swatches, and price discount calculations."
        ],
        tasks: [
            {
                title: "Integrate a custom fabric preset",
                steps: [
                    "Open `src/components/FabricCalculator.tsx`.",
                    "Add custom preset entries (e.g. Saree, Lehenga Choli) in the presets array.",
                    "Modify base meter lengths and width modifiers.",
                    "Verify the calculator modal on the product details page updates properly."
                ]
            }
        ],
        howItWorks: [
            "Product attributes use schemas: 'public.products' (name, slug, care_instructions, sell_mode), 'public.product_variants' (color_name, color_hex, price, stock, sku, is_default).",
            "Fabric Calculator uses formulas: `rawMeters = basePreset * widthFactor * sizeFactor`.",
            "Rounding helper `Math.ceil(rawMeters * 2) / 2` rounds values up to the nearest 0.5m."
        ],
        tips: [
            "Updating product variants automatically purges products cache via revalidateTag('products')."
        ]
    },
    {
        id: "orders",
        title: "Orders Data Flow & Invoice Generator",
        subtitle: "Order mutations actions, status history tracking, and client-side PDF compilation.",
        routeHints: ["src/app/actions/order.ts", "src/utils/invoice/InvoiceGenerator.ts"],
        whatThisDoes: [
            "Controls order mutations via server actions.",
            "Compiles client-side PDF invoices using jsPDF.",
            "Logs status transitions for checkout auditing."
        ],
        tasks: [
            {
                title: "Modify invoice design",
                steps: [
                    "Open `src/utils/invoice/InvoiceGenerator.ts`.",
                    "Locate coordinate definitions (X/Y margins) for the header, item grid, and totals.",
                    "Adjust font size variables, canvas border colors, or logo dimensions.",
                    "Click Download Invoice on the order detail page to verify the new PDF layout."
                ]
            }
        ],
        howItWorks: [
            "Orders are stored in: 'public.orders' (order_number, status, payment_status, total_amount), 'public.order_items' (quantity_or_meters, price_per_unit, total_price, selling_mode), 'public.order_addresses' (type, full_name, phone, address details).",
            "Fulfillment actions run within order server actions and save logs to 'public.order_status_history'.",
            "PDF builder uses jsPDF to compile A4 documents on the fly, auto-wrapping long address text."
        ],
        tips: [
            "Page height is checked at Y=240. If exceeded, the compiler calls 'addPage' to prevent text clipping."
        ]
    },
    {
        id: "customers",
        title: "Customers Schema & Anonymization Engine",
        subtitle: "Summary database views, address default clearing queries, and profile scrubbing logic.",
        routeHints: ["src/app/api/account/delete-request/route.ts", "admin_customer_summary view"],
        whatThisDoes: [
            "Queries the customer summary database view for high-speed admin listing.",
            "Manages customer address directories and handles default address flags.",
            "Executes profile scrubbing logic to anonymize personal records on request."
        ],
        tasks: [
            {
                title: "Inspect customer soft-deletion API",
                steps: [
                    "Open `src/app/api/account/delete-request/route.ts`.",
                    "Verify the database updates: user profile name is overwritten with 'Deleted User', phone is scrubbed, and address references are cleared.",
                    "Ensure the Supabase Auth Admin API is called to randomize the password and change the email address."
                ]
            }
        ],
        howItWorks: [
            "Customer metrics are loaded from the view 'admin_customer_summary' which counts orders and spent totals.",
            "User address default updates clear existing default shipping and default billing flags before setting new default records.",
            "Soft delete anonymizes user email to 'deleted-${userId}@ecomshrihari.local' and assigns the role 'deleted' in metadata."
        ],
        tips: [
            "Do not perform database hard deletions of users, as it breaks historical orders reporting."
        ]
    },
    {
        id: "coupons",
        title: "Coupons Validators & Revenue Aggregators",
        subtitle: "Coupon eligibility checks, assignments mapping, and influenced revenue query formulas.",
        routeHints: ["src/lib/coupons.ts", "public.redeem_coupon_atomic"],
        whatThisDoes: [
            "Validates discount eligibility constraints (minimum cart total, usage counts).",
            "Checks user-specific assignment mappings.",
            "Calculates campaign influenced sales aggregates."
        ],
        tasks: [
            {
                title: "Add coupon eligibility constraint",
                steps: [
                    "Open `src/lib/coupons.ts`.",
                    "Add custom constraints inside the `evaluateCouponEligibility` helper.",
                    "Save and run checkout validations using test coupon codes."
                ]
            }
        ],
        howItWorks: [
            "Coupon schemas: 'public.coupons' (discount_type, discount_value, max_completed_orders_for_eligibility, specific_user_only), 'public.coupon_user_assignments' (coupon_id, user_id), 'public.coupon_redemptions' (discount_amount, redeemed_at).",
            "Redemptions use the database function 'redeem_coupon_atomic' to lock the coupon row during transaction execution."
        ],
        tips: [
            "Edit coupon settings routes to call `revalidateTag('site_config')` to update storefront caches."
        ]
    },
    {
        id: "content-management",
        title: "CMS Schema & Blog Lifecycle Webhook",
        subtitle: "Grouped banners rendering logic, blog media variants, and scheduler publication cron.",
        routeHints: ["src/app/api/admin/blogs/scheduler/route.ts", "cms_banners table"],
        whatThisDoes: [
            "Renders slider banner listings sorted by priority configurations.",
            "Controls category visibility and ordering details.",
            "Manages the blog editor, tags, related products, and scheduled articles."
        ],
        tasks: [
            {
                title: "Verify scheduled publication execution",
                steps: [
                    "Open `src/app/api/admin/blogs/scheduler/route.ts`.",
                    "Ensure scheduler authorization checks are correctly configured.",
                    "Verify the query pulls articles where scheduled date is less than or equal to the current time."
                ]
            }
        ],
        howItWorks: [
            "Banners are stored in 'public.banners' (title, placement, priority, start_date, end_date).",
            "Blog posts use 'public.blog_posts' (cover_media_id, scheduled_for, status, full_page_html).",
            "Scheduler webhook checks image alt text, updates status to 'published', and records success messages in 'blog_publish_notifications'."
        ],
        tips: [
            "Scheduled blog publishing requires checking image alt text attributes. Make sure cover images contain alt text before saving."
        ]
    },
    {
        id: "documentation",
        title: "Documentation Engine & Regex Highlighting",
        subtitle: "Static path generation parameters, regex search parsers, and view settings storage.",
        routeHints: ["src/app/admin/documentation/page.tsx", "src/app/admin/documentation/docsData.ts"],
        whatThisDoes: [
            "Provides the database models and types for the documentation engine.",
            "Indexes guide texts and highlights search matches.",
            "Saves user preferences (Developer Mode toggle)."
        ],
        tasks: [
            {
                title: "Register a documentation section",
                steps: [
                    "Open `src/app/admin/documentation/docsData.ts`.",
                    "Add new documentation objects to the handbook and technical arrays.",
                    "Run a local server build to ensure static routing parameters compile cleanly."
                ]
            }
        ],
        howItWorks: [
            "Static detail pages `/admin/documentation/handbook/[sectionId]` query keys in `docsData.ts` to build routing endpoints.",
            "Search utility escapes special characters, compiles case-insensitive RegExp rules, and highlights matches."
        ],
        tips: [
            "Documentation files use typescript interfaces. Verify new sections match 'Section' type specifications."
        ]
    },
    {
        id: "reports",
        title: "Reports SQL Aggregations & CSV Streams",
        subtitle: "Analytics aggregate queries, date boundary parameters parser, and data streams.",
        routeHints: ["src/app/admin/reports/page.tsx"],
        whatThisDoes: [
            "Aggregates sales performance metrics from the database.",
            "Prepares series data maps for chart rendering.",
            "Assembles CSV strings and handles download events."
        ],
        tasks: [
            {
                title: "Inspect CSV export columns mapping",
                steps: [
                    "Open `src/app/admin/reports/page.tsx`.",
                    "Locate `handleExport` and verify column definitions for each tab.",
                    "Confirm cells with special characters (commas, newlines) are enclosed in double quotes."
                ]
            }
        ],
        howItWorks: [
            "Recharts components consume pre-aggregated state datasets.",
            "Composed chart overlays Area (revenue) and Line (orders) utilizing distinct scale domains.",
            "CSV compiler wraps content in a Blob with type 'text/csv;charset=utf-8;' and click triggers browser downloads."
        ],
        tips: [
            "Ensure order dates are indexed in the database to maintain fast report generation speeds."
        ]
    },
    {
        id: "payments",
        title: "Payments Interceptors & COD Verify Handlers",
        subtitle: "Razorpay signature verify, checkout interceptors, and partial payments logic.",
        routeHints: ["src/payments/razorpay/api/verify-payment.ts", "src/payments/cod/api/place-order.ts"],
        whatThisDoes: [
            "Validates transaction signature authenticity.",
            "Processes COD checkouts and handles partial advance payments."
        ],
        tasks: [
            {
                title: "Inspect verification logic",
                steps: [
                    "Open `src/payments/razorpay/api/verify-payment.ts`.",
                    "Verify the signature validation helper creates a SHA256 HMAC hash using the merchant secret.",
                    "Confirm the generated hash matches the Razorpay signature header value."
                ]
            }
        ],
        howItWorks: [
            "Razorpay verification hashes the order ID and payment ID: `crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex')`.",
            "COD handler creates partial payment orders on Razorpay for COD checkouts if configured."
        ],
        tips: [
            "Always fetch payment keys from Supabase settings or environment variables, and never hardcode them."
        ]
    },
    {
        id: "shipping",
        title: "Shipping Zone Parsers & Checkout Rates Utility",
        subtitle: "State zone config parser, checkout rates formulas, and Razorpay COD checkout orders.",
        routeHints: ["src/lib/shipping/rates.ts", "/api/checkout/shipping-rates"],
        whatThisDoes: [
            "Computes shipping charges based on state groups rules.",
            "Exposes rate API endpoints.",
            "Calculates taxes and COD advance payment requirements."
        ],
        tasks: [
            {
                title: "Test rates calculation formulas",
                steps: [
                    "Open `src/lib/shipping/rates.ts`.",
                    "Verify `calculateCheckoutDetails` correctly resolves shipping default fee, state group matches, and taxes.",
                    "Verify the advance payment calculation for percentage or flat rate COD advances."
                ]
            }
        ],
        howItWorks: [
            "State groups details are parsed from site settings JSONB fields.",
            "Shipping fee resolves to 0 if subtotal matches the free threshold.",
            "Taxes are calculated based on subtotal: added extra or included in price."
        ],
        tips: [
            "Ensure that state groups cover all states and Union Territories to prevent checkout errors."
        ]
    },
    {
        id: "settings",
        title: "Settings Database Keys & Cache Invalidator",
        subtitle: "Theme select variables, custom statuses schemas, and Next.js revalidation tags.",
        routeHints: ["src/app/actions/customStatus.ts", "src/app/api/admin/settings/route.ts"],
        whatThisDoes: [
            "Stores settings key-value configurations.",
            "Manages custom order status codes and label colors.",
            "Handles manual and automatic Next.js cache revalidations."
        ],
        tasks: [
            {
                title: "Verify custom status database write",
                steps: [
                    "Open `src/app/actions/customStatus.ts`.",
                    "Ensure status creation operations successfully write to the database.",
                    "Verify revalidation routines run to sync new statuses."
                ]
            }
        ],
        howItWorks: [
            "System settings are stored in 'public.site_settings' (key, value, updated_at).",
            "Cache busting triggers 'revalidateTag(tag)' for: products, cms_banners, cms_categories, site_config, and blog_posts.",
            "Dev environments skip caching entirely."
        ],
        tips: [
            "Clear settings cache after editing custom status badges to update them in dropdowns."
        ]
    }
];

export const handbookSections = HANDBOOK_SECTIONS;
export const technicalSections = TECH_SECTIONS;

export function getSectionsByMode(mode: DocMode): Section[] {
    return mode === "handbook" ? handbookSections : technicalSections;
}

export function getSection(mode: DocMode, sectionId: string): Section | undefined {
    return getSectionsByMode(mode).find((section) => section.id === sectionId);
}
