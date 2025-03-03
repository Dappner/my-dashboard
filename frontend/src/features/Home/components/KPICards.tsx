import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function KPICards() {


  return (
    <>
      <section className="grid grid-cols-4 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Books Read</CardTitle>
          </CardHeader>
          <CardContent>
            Test
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            Test
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader>
          <CardContent>
            Test
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Books Read</CardTitle>
          </CardHeader>
          <CardContent>
            Test
          </CardContent>
        </Card>

      </section>

    </>
  )
}
