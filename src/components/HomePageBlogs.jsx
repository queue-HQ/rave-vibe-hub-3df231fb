import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { usePosts } from "@/context/PostsContext";

function HomePageBlogs() {
 const { posts, isLoading, error, refetch } = usePosts();

  // Sort by latest and pick top 3
  const latestPosts = posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const hasPosts = latestPosts.length > 0;

  return (
 <section className="px-6">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
        Hot Off The<span className="text-primary"> Decks</span>
      </h2>

     
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
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

        {hasPosts &&
          latestPosts.map((post) => {
            const postSlug = post.slug;

            const categories =
              post.categories?.map((cat) => cat.name).slice(0, 3) || [];

            return (
              <Card key={post.id} className="overflow-hidden hover-lift group">
                <div className="relative h-48 overflow-hidden cursor-default">
                  <img
                    src={
                      post.featured_image ??
                      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 cursor-default text-sm text-muted-foreground">
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
                  </h3></Link>

                  {post.excerpt && (
                    <p className="text-muted-foreground line-clamp-3 cursor-default">
                      {post.excerpt}
                    </p>
                  )}

                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 cursor-default">
                      {categories.map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}

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

      {/* View More Button */}
      <div className="flex justify-center mt-12">
        <Link to="/blogs">
          <Button size="lg" className="text-lg px-8 py-[20px] h-auto font-bold">
            View More
          </Button>
        </Link>
      </div>
    </section>
  );
}

export default HomePageBlogs;
