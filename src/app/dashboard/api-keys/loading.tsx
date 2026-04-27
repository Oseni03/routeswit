import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ApiKeysLoading(): React.ReactElement {
	return (
		<div className="max-w-3xl mx-auto py-8 space-y-6">
			<div className="space-y-1">
				<Skeleton className="h-7 w-32" />
				<Skeleton className="h-4 w-72" />
			</div>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-4">
					<div className="space-y-1">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-4 w-64" />
					</div>
					<Skeleton className="h-9 w-28" />
				</CardHeader>
				<CardContent className="space-y-3">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</CardContent>
			</Card>
		</div>
	);
}
