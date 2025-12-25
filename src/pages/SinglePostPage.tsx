import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { usePosts } from "@/context/PostsContext";
import slugify from "@/lib/slugify";
import { Calendar, User, Tag, ArrowLeft, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { useEffect } from "react";
import Footer from "@/components/Footer";

const SinglePostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { posts, isLoading, error, refetch } = usePosts();

  const toStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];

    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (
          item &&
          typeof item === "object" &&
          "name" in item &&
          typeof item.name === "string"
        ) {
          return item.name;
        }
        return null;
      })
      .filter((item): item is string => Boolean(item));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const post = posts.find((item) => {
    if (!slug) return false;

    if (item.slug) {
      return item.slug === slug;
    }

    if (item.title) {
      return slugify(String(item.title)) === slug;
    }

    return String(item.id) === slug;
  });

  const heroImage =
    post?.featured_image ??
    post?.thumbnail ??
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1600";

  if (isLoading && !post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-14 w-14 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={refetch}>Retry</Button>
            <Link to="/blogs">
              <Button variant="outline">Back to Blogs</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-muted-foreground">Post not found.</p>
            <Link to="/blogs">
              <Button variant="outline">Browse Blogs</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const categories = toStringArray(post.categories as unknown);
  const tags = toStringArray(post.tags as unknown);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="relative h-[60vh] min-h-[360px] overflow-hidden">
        <img
          src={heroImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-5xl mx-auto space-y-4 text-white">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              {post.date && (
                <span className="flex items-center gap-2 text-white">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </span>
              )}
              {post.author && (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              {post.title}
            </h1>
            {/* {post.excerpt && (
              <p className="text-lg text-muted-foreground max-w-3xl">
                {post.excerpt}
              </p>
            )} */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="bg-white/20 text-white"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Link>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              {tags.map((tag) => (
                <span key={tag} className="bg-muted px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <article className="prose prose-invert max-w-none">
          {post.content ? (
            // <div dangerouslySetInnerHTML={{ __html: post.content }} />
            <div
                    className="text-muted-foreground leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
          ) : (
            <p className="text-muted-foreground">
              Full content will appear here once the post is ready.
            </p>
          )}
        </article>
      </div>

        {/* CTA Section */}
     <section className="py-20 px-6">
  <div className="max-w-4xl mx-auto text-center">
    <div className="p-12 rounded-3xl gradient-card neon-border bg-gradient-to-br from-primary/30 via-card to-card shadow-[0_0_60px_hsl(330_81%_60%_/_0.4)]">
      
      <h2 className="text-3xl md:text-5xl font-bold mb-6">
        Think You Belong Here?
      </h2>

      <p className="text-xl text-muted-foreground mb-8">
        Stand in the right line.
      </p>

      <Link to="/signup">
        <Button
          size="lg"
          className="
            font-bold
            h-auto
            px-6 py-3 text-base        /* Mobile */
            sm:px-12 sm:py-[20px] sm:text-lg   /* Desktop */
          "
        >
          Join The Queue
        </Button>
      </Link>

    </div>
  </div>
</section>


      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SinglePostPage;
