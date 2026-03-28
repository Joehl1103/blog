import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

export function ProfilePage() {
  const { user } = useAuth();
  const metadata = user?.user_metadata ?? {};

  const [displayName, setDisplayName] = useState(metadata.display_name ?? "");
  const [bio, setBio] = useState(metadata.bio ?? "");
  const [website, setWebsite] = useState(metadata.website ?? "");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName.trim(),
        bio: bio.trim(),
        website: website.trim(),
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSuccessMessage("Profile saved.");
    setSaving(false);
  };

  return (
    <Card className="mx-auto max-w-4xl border-border/70 bg-background/95 shadow-lg shadow-black/5">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-3xl font-semibold tracking-tight">
          Profile
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 p-8 pt-2">
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input disabled id="profile-email" value={user?.email ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-display-name">Display name</Label>
            <Input
              id="profile-display-name"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="How you want to appear on the site"
              value={displayName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-bio">Bio</Label>
            <textarea
              className="w-full border border-border/70 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              id="profile-bio"
              onChange={(event) => setBio(event.target.value)}
              placeholder="A short description about yourself"
              rows={3}
              value={bio}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-website">Website</Label>
            <Input
              id="profile-website"
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://example.com"
              type="url"
              value={website}
            />
          </div>

          {errorMessage ? (
            <p className="border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="border border-border bg-muted/60 px-4 py-3 text-sm text-foreground">
              {successMessage}
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="border-t border-border/70 p-8">
          <Button disabled={saving} type="submit">
            <Save className="mr-2 size-4" />
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
