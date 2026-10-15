import Loader from '@/components/common/Loader';

export default function Loading() {
	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
			<Loader size="lg" message="Loading Handly services..." />
		</div>
	);
}
