import { Navigate, createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { AccountProfilePage } from "@/features/account/ProfilePage";
import { AuthLayout } from "@/pages/AuthLayout";
import { ForgotPasswordForm } from "@/pages/auth/ForgotPasswordForm";
import { LoginForm } from "@/pages/auth/LoginForm";
import { RegisterForm } from "@/pages/auth/RegisterForm";
import { ResetPasswordForm } from "@/pages/auth/ResetPasswordForm";
import { VerifyAccountForm } from "@/pages/auth/VerifyAccountForm";
import { DashboardLayout } from "@/components/Layout";
import { LoyaltyPage } from "@/features/dashboard/LoyaltyPage";
import { OrdersPage } from "@/features/dashboard/OrdersPage";
import { OverviewPage } from "@/features/dashboard/OverviewPage";
import { ProductsPage } from "@/features/dashboard/ProductsPage";
import { AdminCategoriesPage } from "@/features/admin/CategoriesPage";
import { AdminCategoryCreatePage } from "@/features/admin/CategoryCreatePage";
import { AdminCategoryEditPage } from "@/features/admin/CategoryEditPage";
import { AdminOrdersPage } from "@/features/admin/AdminOrdersPage";
import { AdminProductsPage } from "@/features/admin/ProductsPage";
import { AdminReviewsPage } from "@/features/admin/AdminReviewsPage";
import { AdminSettingsPage } from "@/features/admin/AdminSettingsPage";
import { AdminStoreDetailPage } from "@/features/admin/StoreDetailPage";
import { AdminStoresPage } from "@/features/admin/StoresPage";
import { AdminTaxesPage } from "@/features/admin/AdminTaxesPage";
import { AdminTaxDetailPage } from "@/features/admin/taxes/TaxDetailPage";
import { AdminOrderDetailPage } from "@/features/admin/AdminOrderDetailPage";
import { AdminUserDetailPage } from "@/features/admin/UserDetailPage";
import { AdminUsersPage } from "@/features/admin/UsersPage";
import { BuyerOrderDetailPage } from "@/features/buyer/OrderDetailPage";
import { BuyerOrdersPage } from "@/features/buyer/OrdersPage";
import { BuyerOverviewPage } from "@/features/buyer/OverviewPage";
import { BuyerProfilePage } from "@/features/buyer/ProfilePage";
import { BuyerFavoritesPage } from "@/features/buyer/FavoritesPage";
import { BuyerAddressesPage } from "@/features/buyer/AddressesPage";
import { SellerDiscountCreatePage } from "@/features/seller/DiscountsPage/DiscountCreatePage";
import { SellerDiscountEditPage } from "@/features/seller/DiscountsPage/DiscountEditPage";
import { SellerOverviewPage } from "@/features/seller/OverviewPage";
import { SellerProductCreatePage } from "@/features/seller/ProductCreatePage";
import { SellerProductEditPage } from "@/features/seller/ProductEditPage";
import { ProductPreviewPage } from "@/features/products/ProductPreviewPage";
import { SellerProductsPage } from "@/features/seller/ProductsPage";

import { SellerPromotionCreatePage } from "@/features/seller/PromotionCreatePage";
import { SellerPromotionEditPage } from "@/features/seller/PromotionEditPage";
import { SellerPromotionsPage } from "@/features/seller/PromotionsPage";
import { SellerStorePage } from "@/features/seller/StorePage";
import { SellerTaxCreatePage } from "@/features/seller/TaxCreatePage";
import { SellerTaxEditPage } from "@/features/seller/TaxEditPage";
import { SellerTaxesPage } from "@/features/seller/TaxesPage";
import { SellerShippingPage } from "@/features/seller/ShippingPage";
import { SellerShippingCreatePage } from "@/features/seller/ShippingCreatePage";
import { SellerShippingEditPage } from "@/features/seller/ShippingEditPage";
import { DashboardLanding } from "@/pages/DashboardLanding";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import "quill/dist/quill.snow.css";
import { SellerDiscountsPage } from "./features/seller/DiscountsPage";
import { SellerOrdersPage } from "./features/seller/OrdersPage";
import { SellerOrderDetailPage } from "./features/seller/OrderDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: "/login",
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginForm /> },
      { path: "register", element: <RegisterForm /> },
      { path: "verify", element: <VerifyAccountForm /> },
      { path: "forgot", element: <ForgotPasswordForm /> },
      { path: "reset-password", element: <ResetPasswordForm /> },
    ],
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardLanding /> },
          { path: "account", element: <AccountProfilePage /> },
          {
            path: "analytics",
            element: <ProtectedRoute allowRoles={["admin", "support"]} />,
            children: [
              { index: true, element: <OverviewPage /> },
              { path: "orders", element: <OrdersPage /> },
              { path: "loyalty", element: <LoyaltyPage /> },
              { path: "products", element: <ProductsPage /> },
            ],
          },
          {
            path: "buyer",
            element: <ProtectedRoute allowRoles={["buyer"]} />,
            children: [
              { index: true, element: <BuyerOverviewPage /> },
              { path: "orders", element: <BuyerOrdersPage /> },
              { path: "orders/:orderId", element: <BuyerOrderDetailPage /> },
              { path: "favorites", element: <BuyerFavoritesPage /> },
              { path: "addresses", element: <BuyerAddressesPage /> },
              { path: "profile", element: <BuyerProfilePage /> },
            ],
          },
          {
            path: "seller",
            element: <ProtectedRoute allowRoles={["seller"]} />,
            children: [
              { index: true, element: <SellerOverviewPage /> },
              { path: "store", element: <SellerStorePage /> },
              { path: "products", element: <SellerProductsPage /> },
              { path: "orders", element: <SellerOrdersPage /> },
              { path: "orders/:orderId", element: <SellerOrderDetailPage /> },
              { path: "products/new", element: <SellerProductCreatePage /> },
              {
                path: "products/:productId/edit",
                element: <SellerProductEditPage />,
              },
              {
                path: "products/:productId/preview",
                element: <ProductPreviewPage />,
              },
              { path: "promotions", element: <SellerPromotionsPage /> },
              {
                path: "promotions/new",
                element: <SellerPromotionCreatePage />,
              },
              {
                path: "promotions/:promotionId/edit",
                element: <SellerPromotionEditPage />,
              },
              { path: "discounts", element: <SellerDiscountsPage /> },
              { path: "discounts/new", element: <SellerDiscountCreatePage /> },
              {
                path: "discounts/:discountId/edit",
                element: <SellerDiscountEditPage />,
              },
              { path: "taxes", element: <SellerTaxesPage /> },
              { path: "taxes/new", element: <SellerTaxCreatePage /> },
              { path: "taxes/:taxId/edit", element: <SellerTaxEditPage /> },
              { path: "shipping", element: <SellerShippingPage /> },
              { path: "shipping/new", element: <SellerShippingCreatePage /> },
              {
                path: "shipping/:shippingId/edit",
                element: <SellerShippingEditPage />,
              },
            ],
          },
          {
            path: "admin",
            element: <ProtectedRoute allowRoles={["admin", "support"]} />,
            children: [
              {
                index: true,
                element: <Navigate to="/dashboard/analytics" replace />,
              },
              { path: "users", element: <AdminUsersPage /> },
              {
                path: "users/:userId",
                element: <ProtectedRoute allowRoles={["admin"]} />,
                children: [{ index: true, element: <AdminUserDetailPage /> }],
              },
              { path: "stores", element: <AdminStoresPage /> },
              { path: "stores/:storeId", element: <AdminStoreDetailPage /> },
              { path: "products", element: <AdminProductsPage /> },
              {
                path: "products/:productId/preview",
                element: <ProductPreviewPage />,
              },
              {
                path: "categories",
                element: <ProtectedRoute allowRoles={["admin"]} />,
                children: [
                  { index: true, element: <AdminCategoriesPage /> },
                  { path: "new", element: <AdminCategoryCreatePage /> },
                  {
                    path: ":categoryId/edit",
                    element: <AdminCategoryEditPage />,
                  },
                ],
              },
              {
                path: "taxes",
                element: <ProtectedRoute allowRoles={["admin"]} />,
                children: [
                  { index: true, element: <AdminTaxesPage /> },
                  { path: ":taxId", element: <AdminTaxDetailPage /> },
                ],
              },
              {
                path: "orders",
                element: <ProtectedRoute allowRoles={["admin", "support"]} />,
                children: [
                  { index: true, element: <AdminOrdersPage /> },
                  { path: ":orderId", element: <AdminOrderDetailPage /> },
                ],
              },
              { path: "reviews", element: <AdminReviewsPage /> },
              {
                path: "settings",
                element: <ProtectedRoute allowRoles={["admin"]} />,
                children: [{ index: true, element: <AdminSettingsPage /> }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/auth/login" replace />,
  },
]);

