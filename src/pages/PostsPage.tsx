import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { usePosts } from "@/context/PostsContext";
import slugify from "@/lib/slugify";
import { Calendar, User, Search } from "lucide-react";
import logo from "@/assets/logo.png";
import Footer from "@/components/Footer";

const PostsPage = () => {
  const { posts, isLoading, error } = usePosts();
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return posts;
    }

    return posts.filter((post) => {
      const categoryNames = toStringArray(post.categories as unknown);
      const tagNames = toStringArray(post.tags as unknown);
      const searchableFields = [post.title, post.excerpt, post.author]
        .concat(categoryNames)
        .concat(tagNames);

      return searchableFields.some((field) =>
        typeof field === "string" ? field.toLowerCase().includes(query) : false
      );
    });
  }, [posts, searchQuery]);

  const hasPosts = posts.length > 0;
  const hasFilteredPosts = filteredPosts.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

     <section className="pt-40 pb-16 px-4 sm:px-6 relative overflow-hidden">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(330_81%_60%_/_0.15)_0%,_transparent_60%)]" />
  <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_hsl(330_81%_60%_/_0.15)_60deg,_transparent_180deg)] opacity-40" />

  <div className="max-w-5xl mx-auto text-center relative">
    {/* <p className="uppercase text-xs sm:text-sm tracking-[0.3em] text-primary mb-3 sm:mb-4">
      QHQ Blog
    </p> */}

    {/* Mobile optimized heading */}
    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight px-2">
      Stories from the{" "}
      <span className="
        text-primary
        md:neon-text          
        max-md:neon-text-mobile
      ">
        Underground
      </span>
    </h1>

    <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto px-3">
      Dive into interviews, scene reports, and behind-the-booth moments curated
      by the QHQ collective.
    </p>
  </div>
</section>


      <div className="max-w-6xl mx-auto px-6 mt-[50px]">
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search posts, authors, or tags..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && !hasPosts && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              Loading posts...
            </div>
          )}

          {error && !isLoading && (
            <div className="col-span-full text-center text-destructive py-12">
              {error}
            </div>
          )}

          {!isLoading && !error && !hasPosts && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No posts published yet. Check back soon!
            </div>
          )}

          {!isLoading && !error && hasPosts && !hasFilteredPosts && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No posts match your search.
            </div>
          )}

          {filteredPosts.map((post) => {
            const postSlug =
              post.slug ??
              (post.title ? slugify(String(post.title)) : String(post.id));

            return (
              <Card key={post.id} className="overflow-hidden hover-lift group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      post.featured_image ??
                      post.thumbnail ??
                      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground cursor-default" >
                    {post.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {post.date}
                      </span>
                    )}
                    {post.author && (
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author}
                      </span>
                    )}
                  </div>

                  <Link to={`/blog/${postSlug}`}>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  </Link>

                  {post.excerpt && (
                    <p className="text-muted-foreground line-clamp-3 cursor-default">
                      {post.excerpt}
                    </p>
                  )}

                  {(() => {
                    const categories = toStringArray(
                      post.categories as unknown
                    ).slice(0, 3);
                    if (categories.length === 0) return null;

                    return (
                      <div className="flex flex-wrap gap-2 cursor-default">
                        {categories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="pt-2">
                    <Link to={`/blog/${postSlug}`}>
                      <Button variant="outline" className="w-full">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

     {/* CTA Section */}
     <section className="py-20 px-6">
  <div className="max-w-4xl mx-auto text-center">
    <div className="p-12 rounded-3xl gradient-card neon-border bg-gradient-to-br from-primary/30 via-card to-card shadow-[0_0_60px_hsl(330_81%_60%_/_0.4)]">
      
      <h2 className="text-3xl md:text-5xl font-bold mb-6">
        Ready to Dive In?
      </h2>

      <p className="text-xl text-muted-foreground mb-8">
        Join thousands of ravers already vibing with QHQ
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
          Get Started Now
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

export default PostsPage;
