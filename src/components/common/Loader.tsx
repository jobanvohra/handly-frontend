'use client';

type LoaderProps = {
	message?: string;
	size?: 'sm' | 'md' | 'lg';
	fullScreen?: boolean;
};

export default function Loader({
	message = 'Loading...',
	size = 'md',
	fullScreen = false,
}: LoaderProps) {
	const spinnerSizes = {
		sm: 'h-5 w-5 border-2',
		md: 'h-8 w-8 border-3',
		lg: 'h-12 w-12 border-4',
	};

	const content = (
		<div className="flex flex-col items-center justify-center gap-3">
			<div
				className={`${spinnerSizes[size]} animate-spin rounded-full border-primary/20 border-t-primary`}
			/>
			{message && (
				<p className="text-xs font-medium text-muted-foreground animate-pulse">
					{message}
				</p>
			)}
		</div>
	);

	if (fullScreen) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
				{content}
			</div>
		);
	}

	return (
		<div className="flex min-h-48 items-center justify-center p-6">
			{content}
		</div>
	);
}
