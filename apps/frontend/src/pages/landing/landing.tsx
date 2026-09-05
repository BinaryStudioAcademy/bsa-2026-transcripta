import {
	CTA,
	DocumentTypes,
	Footer,
	Header,
	Hero,
	HowItWorks,
	Loop,
	Problem,
} from "./components/components.js";

const Landing: React.FC = () => {
	return (
		<>
			<Header />
			<Hero />
			<Problem />
			<HowItWorks />
			<Loop />
			<DocumentTypes />
			<CTA />
			<Footer />
		</>
	);
};

export { Landing };
