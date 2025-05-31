import { redirect } from 'next/navigation';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthenticated = false;

  if (isAuthenticated) {
    redirect('/');
  }
  
  return (
    <div className="flex min-h-screen">
      <section className="flex flex-1 justify-center items-center flex-col py-10">
        {children}
      </section>

      <div className="hidden xl:block relative h-screen w-1/2">
        <Image
            src="/assets/images/side-img.svg"
            alt="logo"
            fill 
            className="object-cover" 
            sizes="(max-width: 1280px) 0vw, 50vw" 
        />
      </div>
    </div>
  )
}