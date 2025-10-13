'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LeadForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic (e.g., send to an API endpoint)
    console.log('Lead form submitted with email:', email);
    alert('Thank you for your interest!');
    setEmail('');
  };

  return (
    <section className="w-full bg-blue-600 py-12 md:py-24 lg:py-32">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
            Ready to Start Your Project with Confidence?
          </h2>
          <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Sign up to get started and bring security and peace of mind to your next home service project.
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="max-w-lg flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="bg-white text-blue-600 hover:bg-gray-200">
              Get Started
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
