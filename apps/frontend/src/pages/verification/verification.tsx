import { useParams } from "~/libs/hooks/hooks.js";

const Verification: React.FC = () => {
	const { id } = useParams();
	return <div>Verification: document 'id' is {id}</div>;
};

export { Verification };
