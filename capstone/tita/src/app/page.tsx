"use client"

import { BaseCampaignsLayout } from '@/components/layouts/base_campaign_layout'
import { useWallet } from '@solana/wallet-adapter-react'
import Image from 'next/image'

export default function Page() {
  const { connected } = useWallet()

  return (
    <div>
      {
        connected ? (
          <BaseCampaignsLayout />
        ) : (
          <LandingPageLayout />
        )
      }
    </div>
  )

}

function LandingPageLayout() {
  return (
    <div>
      <section className='w-full flex h-[86vh]'>
        <div className='flex justify-center items-center'>
          <div className='md:mx-12 mx-6 text-white'>
            <div className='text-4xl text-tertiary font-semibold mb-2'>
              ENABLING TRANSPARENT GRANT DISTRIBUTION
            </div>
            <div className='text-lg dark:text-white text-slate-700 font-thin'>
              Automate and secure your grant funding process with Solana
            </div>
          </div>
        </div>
        <div className='md:flex hidden z-50 justify-center ml-5 items-center animate-pulse'>
          <Image src="/belp_landing.png" width={700} height={700} alt="My Image" />
        </div>
      </section>
    </div>
  )
}