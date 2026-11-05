import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  // 1. Who is this? Read it from the session, never from the request body
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Please sign in to leave a review." },
      { status: 401 },
    );
  }

  // 2. Parse the body safely
  let body: { productId?: unknown; rating?: unknown; comment?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // 3. Validate every field. Anything in a request can be faked.
  const rating = Number(body.rating);
  if (
    typeof body.productId !== "string" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "A rating from 1 to 5 is required." },
      { status: 400 },
    );
  }

  const comment =
    typeof body.comment === "string" ? body.comment.trim().slice(0, 1000) : "";

  // 4. Save it and let the database enforce one review per user per product
  try {
    await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: body.productId,
        rating,
        comment: comment || null,
      },
    });
    return NextResponse.json({ message: "Review added." }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 = unique constraint failed (already reviewed this product)
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "You've already reviewed this product." },
          { status: 409 },
        );
      }
      // P2003 = foreign key failed (product or user doesn't exist)
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Product not found." },
          { status: 404 },
        );
      }
    }
    console.error("Review error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
