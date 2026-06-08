import ClassicDefaultCartFullPage from "@/themes/classic/components/cart/DefaultCartFullPage";

export default function DefaultCartFullPage(props: any) {
  // Bohemian has its own CartPage in themes, Classic and Luxury use DefaultCartFullPage
  return <ClassicDefaultCartFullPage {...props} />;
}