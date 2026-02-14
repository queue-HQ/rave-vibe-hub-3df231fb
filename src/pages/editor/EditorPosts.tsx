import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditorLayout from "@/components/layouts/EditorLayout";
import {
  deleteAdminPost,
  getAdminPosts,
  type PostQueryParams,
} from "@/api/admin";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { ExternalLink, Loader2, Plus, Search, Trash2 } from "lucide-react";

const POST_STATUSES = ["publish", "draft", "pending", "future", "private"] as const;
const PER_PAGE = 10;

interface AdminPostRow {
  id: number;
  title: string;
  status: string;
  slug?: string;
  publish_date?: string;
  author?: { id: number; name: string } | null;
  permalink?: string;
}

export default function EditorPosts() {
  const [posts, setPosts] = useState<AdminPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [appliedStatus, setAppliedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    total_pages: 1,
    per_page: PER_PAGE,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadPosts = async (
    page = currentPage,
    overrides: Partial<PostQueryParams> = {},
    searchTerm = search
  ) => {
    try {
      setLoading(true);
      const normalizedStatus = overrides.status ?? appliedStatus;
      const params: PostQueryParams = {
        page,
        per_page: PER_PAGE,
        status: normalizedStatus && normalizedStatus !== "all" ? normalizedStatus : undefined,
        search: searchTerm || undefined,
      };

      const res = await getAdminPosts(params);
      if (res?.success) {
        setPosts(res.data || []);
        const pagination = res.pagination || {};
        setPaginationInfo({
          total: pagination.total ?? (res.data?.length ?? 0),
          total_pages: Math.max(1, pagination.total_pages ?? 1),
          per_page: pagination.per_page ?? PER_PAGE,
        });
        setCurrentPage(page);
      } else {
        toast.error(res?.message || "Failed to load posts");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (postId: number) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      setDeletingId(postId);
      await deleteAdminPost(postId);
      toast.success("Post deleted");
      loadPosts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  const handleApplyFilters = () => {
    setAppliedStatus(statusFilter);
    loadPosts(1, { status: statusFilter }, search);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setAppliedStatus("all");
    setSearch("");
    loadPosts(1, { status: undefined }, "");
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loadPosts(1, { status: statusFilter }, search);
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "publish":
        return "bg-emerald-100 text-emerald-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const handleView = (post: AdminPostRow) => {
    const slug = post.slug;
    const target = post.permalink || (slug ? `/blog/${slug}` : "");
    if (!target) {
      toast.error("Post URL unavailable");
      return;
    }

    const currentUrl = new URL(window.location.href);
    const absoluteUrl = new URL(target, currentUrl.origin);
    currentUrl.searchParams.forEach((value, key) => {
      absoluteUrl.searchParams.set(key, value);
    });

    window.open(absoluteUrl.toString(), "_blank");
  };

  const tableRows = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} className="py-10 text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading posts...
            </div>
          </td>
        </tr>
      );
    }

    if (!loading && posts.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="py-10 text-center text-muted-foreground">
            No posts found.
          </td>
        </tr>
      );
    }

    return posts.map((post) => (
      <tr key={post.id} className="border-b last:border-0">
        <td className="py-4">
          <div className="font-medium">{post.title || "Untitled"}</div>
          <div className="text-sm text-muted-foreground">ID: {post.id}</div>
        </td>
        <td className="py-4">
          <span className={cn("rounded-full px-3 py-1 text-xs font-medium", statusBadgeClass(post.status))}>
            {post.status}
          </span>
        </td>
        <td className="py-4 text-sm text-muted-foreground">
          {post.publish_date ? format(new Date(post.publish_date), "PP p") : "—"}
        </td>
        <td className="py-4 text-sm text-muted-foreground">{post.author?.name || "—"}</td>
        <td className="py-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleView(post)}
              disabled={!post.slug && !post.permalink}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> View
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/editor/posts/${post.id}/edit`}>Edit</Link>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(post.id)}
              disabled={deletingId === post.id}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deletingId === post.id ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </td>
      </tr>
    ));
  }, [posts, loading, deletingId]);

  const totalPages = paginationInfo.total_pages || 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <EditorLayout title="Manage Posts">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Posts</CardTitle>
              <CardDescription>Search, filter, create, and manage blog posts.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => loadPosts(currentPage)}>
                Refresh
              </Button>
              <Button asChild>
                <Link to="/editor/posts/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Post
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-4 rounded-lg border p-4">
            <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleSearchSubmit}>
              <div className="flex-1">
                <label className="sr-only" htmlFor="search-posts">
                  Search posts
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search-posts"
                    placeholder="Search by title or author"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {POST_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button type="submit" variant="secondary">
                  Apply
                </Button>
                <Button type="button" variant="outline" onClick={handleClearFilters}>
                  Clear
                </Button>
              </div>
            </form>
          </section>

          <section className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="py-3 pl-4 text-left font-medium text-muted-foreground">Title</th>
                  <th className="py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="py-3 text-left font-medium text-muted-foreground">Publish date</th>
                  <th className="py-3 text-left font-medium text-muted-foreground">Author</th>
                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <div>
              Page {currentPage} of {totalPages} • {paginationInfo.total} total posts
            </div>
            <div className="flex flex-wrap gap-2">
              {pageNumbers.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => loadPosts(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>
    </EditorLayout>
  );
}
