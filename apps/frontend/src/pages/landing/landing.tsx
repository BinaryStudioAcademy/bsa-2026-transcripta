import {
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
		</>
	);
};

export { Landing };
