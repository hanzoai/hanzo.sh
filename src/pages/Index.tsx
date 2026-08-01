import Hero from "@/components/Hero";

// One route, one component. Hero is the whole page — it carries its own header
// and footer, so anything rendered beside it here is a SECOND header and a
// SECOND footer on the same screen. That is what used to happen: a leftover
// template Navbar, Features and Footer rendered under the real page, adding a
// competing fixed nav, four invented feature cards, sixteen `href="#"` links
// and a "© 2024" that disagreed with the copyright ten pixels above it.
const Index = () => <Hero />;

export default Index;
