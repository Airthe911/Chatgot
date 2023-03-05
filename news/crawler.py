import parsel
import requests

url = "http://www.chinadaily.com.cn/opinion/topdiscusstion/"
res = requests.get(url)
res.encoding = res.apparent_encoding
sel = parsel.Selector(res.text)

links = sel.css('h4 > a::attr(href)').getall()
image_links = sel.css('div a > img::attr(src)').getall()

for i in range(0, 10):
    link = 'http:'+links[i]
    # print(link)

    res2 = requests.get(link)
    res2.encoding = res2.apparent_encoding
    web = parsel.Selector(res2.text)
    title = web.css('title::text').getall()
    title = title[0]
    # print(title)

    res = requests.get(link)
    res.encoding = res.apparent_encoding

    sel = parsel.Selector(res.text)
    texts = sel.css('#Content > p::text').getall()
    # print(texts)
    text = ''

    with open("news/" + str(i + 1) + ".txt", 'w', encoding='utf-8') as file_read:
        for t in texts:
            file_read.write(t)
        file_read.close()
    with open("titles/" + str(i + 1) + ".txt", 'w', encoding='utf-8') as file_read:
        file_read.write(str(i + 1)+". ")
        file_read.write(title)
        file_read.close()

for j in range(5, 15):
    image_link = 'http:' + image_links[j]
    # print(image_link)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36'
    }
    r = requests.get(image_link, headers=headers)
    with open("image/" + str(j - 4) + ".jpg", mode="wb") as f:
        f.write(r.content)