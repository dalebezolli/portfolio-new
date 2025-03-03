import { useState } from "preact/hooks";
import Input from "../components/Input";
import Button from "../components/Button";
import { post } from "../utils/network";
import { useGlobalState } from "../state/GlobalState";

export default function Login() {
	const {setAuthPassword} = useGlobalState();
	const [password, setPassword] = useState<string>("");

	async function login() {
		const request = await post<null>({ url: new URL(`${import.meta.env.VITE_CMS_URL}/auth/login`), body: {
			pass: password,
		}});
		if(request == null) return;

		if(request.status != "ok") return;

		setAuthPassword(password);
	}

	return (
		<div className="bg-gray-950 text-white min-w-screen min-h-screen flex justify-center items-center" id="top">
			<div className="flex flex-col gap-2 items-start">
			<p>Type your password to login</p>
			<Input placeholder="Password" value={password} onChange={e => setPassword(e.currentTarget.value)} />
			<Button text="Login" color="highlight" onClick={login} />
			</div>
		</div>
	);
}
