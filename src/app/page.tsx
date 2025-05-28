import Head from 'next/head';

import InteractiveButtonSection from '@/components/InteractiveButtonSection'; 
export default function Home() {
  return (
    <>
      <Head>
        <title>Social App MVP</title>
        <meta name="description" content="Social media app MVP prep" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-md mb-8">
          Welcome to your Social App!
        </h1>
        <InteractiveButtonSection />
      </main>
    </>
  );
}