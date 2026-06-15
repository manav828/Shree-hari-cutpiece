# Graph Report - ecomshrihari  (2026-06-15)

## Corpus Check
- 350 files · ~3,122,851 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1008 nodes · 1270 edges · 56 communities detected
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 172 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 70|Community 70]]

## God Nodes (most connected - your core abstractions)
1. `GET()` - 74 edges
2. `POST()` - 67 edges
3. `PATCH()` - 32 edges
4. `DELETE()` - 28 edges
5. `handlePlaceOrder()` - 14 edges
6. `handleCreateOrder()` - 13 edges
7. `getAccessToken()` - 12 edges
8. `triggerOrderNotification()` - 11 edges
9. `getSiteUrl()` - 11 edges
10. `getThemeSync()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `isSubActive()` --calls--> `GET()`  [INFERRED]
  src\app\admin\layout.tsx → src\app\api\shop\reviews\route.ts
- `deleteProduct()` --calls--> `DELETE()`  [INFERRED]
  src\app\admin\products\page.tsx → src\app\api\admin\products\[id]\reviews\route.ts
- `GET()` --calls--> `readJsonResponse()`  [INFERRED]
  src\app\api\shop\reviews\route.ts → src\components\admin\blog\BlogEditor.tsx
- `DELETE()` --calls--> `toggleUser()`  [INFERRED]
  src\app\api\admin\products\[id]\reviews\route.ts → src\components\admin\coupons\CouponForm.tsx
- `DELETE()` --calls--> `handleDeleteNotification()`  [INFERRED]
  src\app\api\admin\products\[id]\reviews\route.ts → src\components\admin\layout\AdminNotificationsBell.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (48): getAuthenticatedUserId(), getAuthToken(), cleanNullableString(), cleanString(), isThemeAgnosticLayout(), listFromUnknown(), normalizeBlogPayload(), parseBlogListFilters() (+40 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (14): processImageForUpload(), addFabricRow(), AddProductPage(), addTab(), deleteTab(), handleSave(), Label(), moveTab() (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (31): fetchNotificationConfig(), fetchNotificationTemplates(), fetchTemplateByKey(), formatItemsHtml(), formatItemsText(), handleUserRegistrationNotification(), replaceVariables(), sendResendEmail() (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (10): updateNotificationTemplate(), formatDate(), formatDateTime(), formatInr(), formatPrice(), loadAnalytics(), loadCoupons(), toggleStatus() (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (12): BlogCard(), BlogRenderer(), Button(), useCart(), CartSidebar(), Container(), Footer(), Navbar() (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (22): getCacheEnabled(), fetchActiveCmsCategories(), fetchCmsBanners(), fetchSiteConfigMap(), getActiveCmsBannersByPlacement(), getActiveCmsCategories(), getSiteConfigMap(), getTodayInIstDateString() (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (16): getWhatsAppUrl(), closeOnEsc(), formatPrice(), handleUpsellQuickAdd(), generateInvoicePDF(), fDate(), fDateTime(), formatOptionSummary() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (20): filterPublicContentPosts(), isPublicContentPost(), getSection(), getSectionsByMode(), fetchRecentJournalPosts(), collectText(), estimateReadTime(), extractTextFromLayout() (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.1
Nodes (11): getThumbnailUrl(), deleteProduct(), fetchCategories(), generateSlug(), getThumbnail(), getVariantThumbnail(), handleAdd(), handleAdjustStock() (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (20): calculateCouponDiscount(), evaluateCouponEligibility(), isCouponActive(), normalizeCouponCode(), buildDeliveryAddress(), createRazorpayOrder(), generateOrderNumber(), getAuthToken() (+12 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (9): isSubActive(), BlogGonePage(), PolicyPageLayout(), downloadAndUploadImage(), seed(), fetchActiveTheme(), getActiveTheme(), getDefaultTheme() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.19
Nodes (5): decrypt(), encrypt(), getSecretKey(), ShippingManager, ShiprocketService

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (5): escapeHtml(), highlightCode(), highlightHtml(), readJsonResponse(), tokenizeCode()

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (12): robots(), buildPageMetadata(), toAbsoluteUrl(), buildArticleSchema(), buildLocalBusinessSchema(), buildOrganizationSchema(), buildProductSchema(), buildWebPageSchema() (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.27
Nodes (11): downloadAccountData(), getAccessToken(), loadAddresses(), loadPreferences(), loadProfile(), remove(), requestDeleteAccount(), resetForm() (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.19
Nodes (8): addSpaceItem(), fetchTestimonials(), handleDeleteTestimonial(), handleSaveConfig(), handleSaveTestimonial(), moveSpaceItem(), newSpaceItemSave(), removeSpaceItem()

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (2): formatBytes(), formatDate()

### Community 17 - "Community 17"
Cohesion: 0.23
Nodes (8): buildDummyProduct(), copyToClipboard(), fetchProduct(), handleShareProduct(), mapRelatedProducts(), mergeUniqueRelated(), normalizeSpecKey(), toTitleFromSlug()

### Community 18 - "Community 18"
Cohesion: 0.27
Nodes (9): createCustomStatus(), deleteCustomStatus(), updateCustomStatus(), handleAdd(), handleDelete(), handleEdit(), load(), loadCustomStatuses() (+1 more)

### Community 19 - "Community 19"
Cohesion: 0.19
Nodes (5): detectColorFamily(), detectFabricType(), detectKeywordLabel(), fetchData(), normalizeText()

### Community 20 - "Community 20"
Cohesion: 0.21
Nodes (4): handleCheckout(), loadRazorpayScript(), getMissingFieldMessage(), handlePlaceOrder()

### Community 21 - "Community 21"
Cohesion: 0.27
Nodes (7): updateOrderNotes(), updateOrderStatus(), updateOrderTracking(), handleSaveNotes(), handleSaveTracking(), handleStatusChange(), showToast()

### Community 22 - "Community 22"
Cohesion: 0.31
Nodes (7): load(), openCreate(), reorder(), resetDraft(), saveCreate(), saveEdit(), softDelete()

### Community 23 - "Community 23"
Cohesion: 0.31
Nodes (9): asTrimmedString(), checkDelimiterBalance(), checkHtmlIssues(), getCodeIssuesForBlock(), getCustomCodeBlocks(), hasCustomJsInLayout(), getCustomCodeSummary(), hasMissingAltText() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.28
Nodes (5): fetchDashboardMetrics(), buildAreaPath(), buildBezierPath(), handleRefresh(), loadData()

### Community 25 - "Community 25"
Cohesion: 0.36
Nodes (6): bulkUploadAndCreate(), handleSave(), saveHeroLayoutMode(), updateDraftField(), uploadBannerImage(), uploadBulkImages()

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (2): handleSubmitReview(), loadReviewsAndSettings()

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (2): getProductCountForCategory(), mapCmsCategoryToCard()

### Community 28 - "Community 28"
Cohesion: 0.39
Nodes (5): load(), quickToggle(), quickTogglePlacement(), softDelete(), softDeletePlacement()

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (3): handleDeleteNotification(), handleMarkAsRead(), handleNotificationClick()

### Community 30 - "Community 30"
Cohesion: 0.25
Nodes (2): useAuth(), CouponAnnouncementBar()

### Community 31 - "Community 31"
Cohesion: 0.62
Nodes (6): checkAdminRole(), fetchSupabase(), getUserIdFromToken(), isUnpublished(), middleware(), resolveRedirect()

### Community 32 - "Community 32"
Cohesion: 0.38
Nodes (4): parseOptionalNumber(), submitWithValidation(), toggleUser(), validate()

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (1): DelhiveryService

### Community 35 - "Community 35"
Cohesion: 0.62
Nodes (4): handlePointerDown(), handlePointerMove(), handlePointerUp(), updateProgress()

### Community 36 - "Community 36"
Cohesion: 0.47
Nodes (3): fetchSettings(), handleSaveTheme(), isThemeOption()

### Community 37 - "Community 37"
Cohesion: 0.4
Nodes (2): fetchPaymentSettings(), handleSave()

### Community 38 - "Community 38"
Cohesion: 0.6
Nodes (3): checkScroll(), fetchFeatured(), scroll()

### Community 39 - "Community 39"
Cohesion: 0.4
Nodes (2): normalizeText(), toggleCategory()

### Community 40 - "Community 40"
Cohesion: 0.47
Nodes (4): getGitRemote(), question(), run(), close()

### Community 41 - "Community 41"
Cohesion: 0.7
Nodes (4): getAdminToken(), getAuthHeaders(), handleClear(), handleToggle()

### Community 42 - "Community 42"
Cohesion: 0.5
Nodes (2): formatPrice(), generateWhatsAppLink()

### Community 43 - "Community 43"
Cohesion: 0.6
Nodes (2): asNumber(), asString()

### Community 44 - "Community 44"
Cohesion: 0.6
Nodes (2): handleCopy(), handleNativeShare()

### Community 45 - "Community 45"
Cohesion: 0.6
Nodes (2): buildItemMeta(), handleBack()

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (2): getBohemianListingVariant(), normalizeCategory()

### Community 49 - "Community 49"
Cohesion: 0.67
Nodes (2): fetchPublishedPosts(), getSingleParam()

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (2): handleChange(), handleSubmit()

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (3): applyPlpFiltersAndSort(), isAllCategory(), normalizeValue()

### Community 54 - "Community 54"
Cohesion: 0.5
Nodes (1): run()

### Community 55 - "Community 55"
Cohesion: 0.5
Nodes (1): TrustSection()

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (1): fetchProduct()

### Community 57 - "Community 57"
Cohesion: 0.67
Nodes (1): ThemeFallbackResolverPlugin

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (2): hexToRgba(), OrderStatusBadge()

### Community 68 - "Community 68"
Cohesion: 0.67
Nodes (1): StoreSection()

### Community 70 - "Community 70"
Cohesion: 0.67
Nodes (1): ShopPage()

## Knowledge Gaps
- **Thin community `Community 16`** (15 nodes): `clearSelection()`, `formatBytes()`, `formatDate()`, `handleAltSave()`, `handleCopySelectedUrls()`, `handleCopyUrl()`, `handleDelete()`, `handleDeleteSelected()`, `handleDragLeave()`, `handleDragOver()`, `handleDrop()`, `handleUpload()`, `selectAllOnPage()`, `toggleSelect()`, `BlogMediaLibraryModal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (9 nodes): `fullPage()`, `handleImageChange()`, `handleStarFilterClick()`, `handleSubmitReview()`, `handleVideoChange()`, `loadReviewsAndSettings()`, `openLightbox()`, `removeImageFile()`, `ProductReviews.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (9 nodes): `buildListingCategoryOptions()`, `buildMoreCategories()`, `buildPrimaryCategories()`, `extractCategory()`, `getProductCountForCategory()`, `mapCmsCategoryToCard()`, `mapRowsToListingProducts()`, `normalizeValue()`, `ShopPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (8 nodes): `AuthProvider()`, `mapUser()`, `useAuth()`, `CouponAnnouncementBar()`, `CouponAnnouncementBar.tsx`, `AuthContext.tsx`, `CouponAnnouncementBar.tsx`, `CouponAnnouncementBar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (7 nodes): `DelhiveryService`, `.checkServiceability()`, `.constructor()`, `.createShipment()`, `.testCredentials()`, `.trackShipment()`, `DelhiveryService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (6 nodes): `fetchPaymentSettings()`, `handleFieldChange()`, `handleSave()`, `handleToggle()`, `toggleSecret()`, `PaymentSettingsManager.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (6 nodes): `handleOutsideClick()`, `handleQuickAdd()`, `normalizeText()`, `sortProducts()`, `toggleCategory()`, `BohemianProductListing.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (5 nodes): `utils.ts`, `cn()`, `formatPrice()`, `generateWhatsAppLink()`, `replaceVariables()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (5 nodes): `asNumber()`, `asString()`, `BlogRenderer.tsx`, `BlogRenderer.tsx`, `BlogRenderer.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (5 nodes): `handleCopy()`, `handleNativeShare()`, `ShareButtons.tsx`, `ShareButtons.tsx`, `ShareButtons.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (5 nodes): `buildItemMeta()`, `handleBack()`, `DefaultCartFullPage.tsx`, `DefaultCartFullPage.tsx`, `DefaultCartFullPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (5 nodes): `formatCategoryName()`, `getBohemianFallbackProducts()`, `getBohemianListingVariant()`, `normalizeCategory()`, `bohemianListingData.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (4 nodes): `fetchPublishedPosts()`, `getSingleParam()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (4 nodes): `handleChange()`, `handleSubmit()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (4 nodes): `run()`, `CouponAnnouncementBar.tsx`, `CouponAnnouncementBar.tsx`, `CouponAnnouncementBar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (4 nodes): `TrustSection.tsx`, `TrustSection.tsx`, `TrustSection.tsx`, `TrustSection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (4 nodes): `fetchProduct()`, `ReviewsPage.tsx`, `ReviewsPage.tsx`, `ReviewsPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (3 nodes): `next.config.mjs`, `ThemeFallbackResolverPlugin`, `.apply()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (3 nodes): `hexToRgba()`, `OrderStatusBadge()`, `OrderStatusBadge.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (3 nodes): `StoreSection.tsx`, `StoreSection.tsx`, `StoreSection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (3 nodes): `ShopPage()`, `ShopPage.tsx`, `ShopPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DELETE()` connect `Community 0` to `Community 32`, `Community 1`, `Community 39`, `Community 8`, `Community 9`, `Community 14`, `Community 18`, `Community 29`, `Community 31`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 0` to `Community 2`, `Community 5`, `Community 9`, `Community 10`, `Community 12`, `Community 50`, `Community 23`, `Community 24`, `Community 31`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Why does `POST()` connect `Community 0` to `Community 2`, `Community 5`, `Community 9`, `Community 11`, `Community 23`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Are the 21 inferred relationships involving `GET()` (e.g. with `middleware()` and `downloadAndUploadImage()`) actually correct?**
  _`GET()` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 21 inferred relationships involving `POST()` (e.g. with `getAuthenticatedUserId()` and `DELETE()`) actually correct?**
  _`POST()` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `PATCH()` (e.g. with `getAuthenticatedUserId()` and `listFromUnknown()`) actually correct?**
  _`PATCH()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `DELETE()` (e.g. with `middleware()` and `deleteCustomStatus()`) actually correct?**
  _`DELETE()` has 16 INFERRED edges - model-reasoned connections that need verification._