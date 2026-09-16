import BookNowButton from '@/components/providers/BookNowButton';

export default async function ProviderProfilePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const res = await fetch(`${process.env.SERVER_URL}/api/providers/${id}`, {
		next: { revalidate: 300 },
	});
	const { data } = await res.json();
	return (
		<div>
			<h1>{data.category}</h1>
			<p>{data.bio}</p>
			<p>₹{data.ratePerHour}/hr</p>
			<BookNowButton providerId={id} />
		</div>
	);
}
