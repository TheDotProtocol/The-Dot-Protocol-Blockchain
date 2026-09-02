import Link from 'next/link';

type DetailRowProps = {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  href?: string;
};

export default function DetailRow({ label, value, mono, href }: DetailRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-white/5 last:border-0">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className={`sm:col-span-2 text-sm break-all ${mono ? 'mono' : ''}`}>
        {href ? (
          <Link href={href} className="text-primary hover:underline">
            {value}
          </Link>
        ) : (
          <span className="text-zinc-200">{value}</span>
        )}
      </dd>
    </div>
  );
}
