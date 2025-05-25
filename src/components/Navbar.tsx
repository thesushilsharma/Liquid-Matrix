"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useOrderBook } from "@/hooks/useOrderBook";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "./auth/logout-button";

export function NavBar() {
  const { resetOrderBook } = useOrderBook();
  const { session } = useAuth();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Activity className="h-6 w-6" />
          <span>Liquid Matrix</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <Button variant="outline" onClick={resetOrderBook}>
                Reset Order Book
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {session.user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
