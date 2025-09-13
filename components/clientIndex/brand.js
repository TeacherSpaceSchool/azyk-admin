import React from 'react';
import Link from 'next/link';

const colors = ['linear-gradient(to right, #8546c8, #0092ed, #54c1e0)', 'linear-gradient(to right, #249c7d, #42bf63, #93dc12)', 'linear-gradient(to right, #fa1c0c, #ff187c, #d860c7)', 'linear-gradient(to right, #51db8d, #6ce16d, #8fe542)', 'linear-gradient(to right, #a999e9, #7e5ff7, #4500fe)', 'linear-gradient(to right, #2ade52, #00a491, #3e636d)', 'linear-gradient(to right, #c06d79, #ca4f91, #b141c3)', 'linear-gradient(to right, #dabd96, #fe6784, #8a4efb)', 'linear-gradient(to right, #915f84, #8478ab, #6793c5)', 'linear-gradient(to right, #3e5b74, #00b5a0, #e4f315)', 'linear-gradient(to right, #11c492, #918a23, #aa4035)', 'linear-gradient(to right, #95bb01, #eb2c2c, #6e13b4)', 'linear-gradient(to right, #186dd9, #00bbff, #1bfef3)', 'linear-gradient(to right, #29e0c1, #00a4ff, #3014fc)', 'linear-gradient(to right, #4122bd, #0074b6, #3a8c6a)', 'linear-gradient(to right, #2f1eae, #7e2cd2, #c43cf4)', 'linear-gradient(to right, #df9cfc, #f9618a, #bf5c0a)', 'linear-gradient(to right, #a355f6, #767fdf, #8291b0)', 'linear-gradient(to right, #053f2e, #308769, #5fd7a9)', 'linear-gradient(to right, #b04620, #702758, #06223e)', 'linear-gradient(to right, #b72138, #d1172c, #e81317)', 'linear-gradient(to right, #b9cdbf, #00b7d3, #5381f4)', 'linear-gradient(to right, #7362ab, #9a6ec0, #c378d2)', 'linear-gradient(to right, #64ecb5, #67b26d, #5c7b34)', 'linear-gradient(to right, #0e0bf9, #00b3ff, #2bf65c)', 'linear-gradient(to right, #9304ae, #c50080, #d52a59)', 'linear-gradient(to right, #59f144, #59f144, #bf79e1)', 'linear-gradient(to right, #61b5ac, #3fc2a9, #17cd9d)', 'linear-gradient(to right, #711f93, #0078b6, #369765)', 'linear-gradient(to right, #efdd05, #d2af09, #b08410)', 'linear-gradient(to right, #fe7511, #f87a6d, #d3919c)', 'linear-gradient(to right, #67c2dc, #1e6bac, #3b0257)', 'linear-gradient(to right, #1b3324, #36676e, #8297b7)', 'linear-gradient(to right, #fb5e4a, #da3942, #b8043a)', 'linear-gradient(to right, #9dab43, #9dc639, #91e334)', 'linear-gradient(to right, #1844c4, #7a4299, #875279)', 'linear-gradient(to right, #971213, #a91e53, #a0458c)', 'linear-gradient(to right, #6d13ef, #009bff, #53d4df)', 'linear-gradient(to right, #18a62e, #00c67f, #27e4c3)', 'linear-gradient(to right, #d7bd66, #d79543, #d56834)', 'linear-gradient(to right, #fb2489, #f939ad, #ef51d0)', 'linear-gradient(to right, #6c4665, #943797, #af1ad4)', 'linear-gradient(to right, #c4590a, #ef3151, #f721a2)', 'linear-gradient(to right, #1ba4ed, #7f76e7, #cd02a0)', 'linear-gradient(to right, #030347, #1c3889, #2c70d0)', 'linear-gradient(to right, #d405e5, #ff5263, #d0a95f)', 'linear-gradient(to right, #af28aa, #8700bf, #0802d9)', 'linear-gradient(to right, #1cb097, #008de6, #392ee6)', 'linear-gradient(to right, #de2f64, #ff8a34, #e4e63d)', 'linear-gradient(to right, #88466f, #ba4371, #e84262)', 'linear-gradient(to right, #af06b2, #6b41ae, #344b94)', 'linear-gradient(to right, #ab0942, #8c0643, #6d093f)', 'linear-gradient(to right, #178b44, #65ac65, #9ecd8c)', 'linear-gradient(to right, #922e56, #8e1c66, #7f137c)', 'linear-gradient(to right, #2844ad, #0096c9, #2ec64b)', 'linear-gradient(to right, #1a0849, #00669f, #0dc0c2)', 'linear-gradient(to right, #2bed7f, #37c87b, #43a373)', 'linear-gradient(to right, #2fa6ca, #21ae7b, #b89501)', 'linear-gradient(to right, #5c10f3, #af3ac3, #bf72a8)', 'linear-gradient(to right, #a3e4ec, #4cdaae, #79c12a)', 'linear-gradient(to right, #1d62ff, #9183ee, #beabe0)', 'linear-gradient(to right, #11c058, #f67700, #f831e1)', 'linear-gradient(to right, #fa52c8, #ff9f51, #b3fc8c)', 'linear-gradient(to right, #924766, #c23b6a, #f21e63)', 'linear-gradient(to right, #183ffd, #0078f5, #669dd7)', 'linear-gradient(to right, #df2195, #b65f24, #627d42)', 'linear-gradient(to right, #a1259f, #6e2d9d, #302f94)', 'linear-gradient(to right, #a9913b, #969355, #8a926e)', 'linear-gradient(to right, #9309c3, #fe5221, #84db46)', 'linear-gradient(to right, #c60fe2, #00b9ff, #45ecc0)', 'linear-gradient(to right, #9e9464, #a9c04d, #87f447)', 'linear-gradient(to right, #24cdbe, #0085df, #2903a9)', 'linear-gradient(to right, #f00d57, #ff8c37, #f6e45c)', 'linear-gradient(to right, #299fcb, #009b93, #0d8910)', 'linear-gradient(to right, #e351c2, #ff8129, #7af114)', 'linear-gradient(to right, #73f7fd, #3bcbff, #8893f0)', 'linear-gradient(to right, #a029da, #7121bb, #44179b)', 'linear-gradient(to right, #2cbeeb, #2480a3, #16475f)', 'linear-gradient(to right, #fb4e1c, #de7915, #c39333)', 'linear-gradient(to right, #4d1277, #00445f, #3b4239)', 'linear-gradient(to right, #51c6df, #0094ea, #614dcc)', 'linear-gradient(to right, #175965, #0056a6, #6d16b4)', 'linear-gradient(to right, #f4027f, #b659a6, #80719c)', 'linear-gradient(to right, #6a83a7, #5985ca, #4f84eb)', 'linear-gradient(to right, #0f9b82, #2ca15f, #5ea32a)', 'linear-gradient(to right, #bfb743, #e28447, #dc5973)', 'linear-gradient(to right, #4a3355, #8e378b, #e508b1)', 'linear-gradient(to right, #eb44e7, #ff485f, #b88125)', 'linear-gradient(to right, #5bfe5d, #f1963d, #ad6384)', 'linear-gradient(to right, #5c3063, #a143a3, #f051e2)', 'linear-gradient(to right, #71280f, #864610, #966515)', 'linear-gradient(to right, #1bde9f, #009be2, #2e38b5)', 'linear-gradient(to right, #c28927, #8f5329, #512920)', 'linear-gradient(to right, #f0e36d, #ff7f5a, #f20bb9)', 'linear-gradient(to right, #176da2, #0057cb, #4f13d5)', 'linear-gradient(to right, #610b60, #ba2946, #d38213)', 'linear-gradient(to right, #531c0f, #ab6022, #f5b62e)', 'linear-gradient(to right, #a80b73, #b82979, #c73e80)', 'linear-gradient(to right, #33a1ff, #0084bd, #1e647d)', 'linear-gradient(to right, #ce0c70, #9270d4, #04a5e7)']

const Brand = React.memo(({element, idx}) => {
    return <Link href={'/catalog/[id]'} as={`/catalog/${element._id}`}>
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: 130,
                borderRadius: 14,
                background: colors[idx],
                padding: 2, // толщина рамки
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 12, // чуть меньше, чтобы градиент был виден
                    background: 'white',
                    paddingLeft: 20,
                    paddingRight: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                }}
            >
                <div style={{height: 100, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-start', flexDirection: 'column'}}>
                    <div style={{fontWeight: '500', fontSize: '1.125rem', color: 'black'}}>
                        {element.name}
                    </div>
                    <div style={{fontSize: '1rem', color: 'rgba(0, 0, 0, 0.8)', whiteSpace: 'pre-line'}}>
                        {element.miniInfo}
                    </div>
                </div>
                <img
                    style={{height: 100, aspectRatio: '1/1', borderRadius: 12}}
                    src={element.image}
                    alt={element.name}
                    loading='lazy'
                />
            </div>
        </div>
    </Link>
})

export default Brand;
