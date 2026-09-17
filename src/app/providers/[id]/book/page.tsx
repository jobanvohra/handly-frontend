import BookingForm from '@/components/bookings/BookingForm';

export default async function BookingPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return (
		<div>
			<BookingForm providerId={id} />
		</div>
	);
}
